const Command = require('command'),
	  Notifier = require('tera-notifier')

//Defaults
const NO_REPEATS=true,			//No continual repetition notifications from previously informed parties, based on leader to differentiate.
	  PRETEND_LEGIT=true,		//Pretend you are legitimately searching with window open. Very experimental and this does not mean totally risk-free lul.
	  SEARCH_INTERVAL=30000,	//Default interval to search for lfgs. In milsecs. (default=30000ms=30s)
	  TRY_AGAIN_INTERVAL=200,	//Default interval to retry search for lfg if previous search fail. Put a small delay for this. (It is unnatural for you to search multiple times before the initial search has returned to your pc) 
	  
	  CHECK_MAX_MEMBER=true,		//Check if the raid has max number of members already, and prevent notification if so. False sets max member to 31.
	  JOIN_PARTY_STOPS_SEARCH=true	//Joining a party auto stops searches and clears it
	  
	  
let lowerRange=60,				//Lower Level range to search for
	upperRange=65,				//Upper Level range to search for
	soundId='Notification.IM'	//Use true for default windows notification sound. Or use false for silence. For more, read: http://msdn.microsoft.com/en-us/library/windows/apps/hh761492.aspx
	
	
//Raid Maximum Member Numbers
const raidList=['cw','ab','vh','ai','hh','rally','event'],	//List out the normally used terms for raids here (ONLY RAIDS)
	  raidMaxNumber=[3,7,7,10,20,30,30]						//List out corresponding raid max member number

	  
module.exports = function lfgfinder(dispatch) {
	const command = Command(dispatch),
		  notifier = Notifier(dispatch)
	
	let messages=[],
		searchterms=[],
		searchno=[],
		leadlist=[],
		maxnumber,
		timer=null,
		searching=false,
		windowopened=false

	
	/////Commands
	command.add('lfgrange', (lower,higher) => {
		lowerRange=parseInt(lower)
		upperRange=parseInt(higher)
		command.message('(LFG Finder) Level range set to '+lower+' to '+higher)
	})
	
	command.add('lfgfind', args => { //investigate later how to use ...args 
		if(args===undefined) leadlist=[] //reset leadlist if no argument
		
		args=args.split(',')
		
		for(let term of args) {
			max(term.toLowerCase())
			searchterms.push(term.toLowerCase())
		}
		
		clearTimeout(timer)
		finder()
		command.message('(LFG Finder) Current Search: '+searchterms)
	})
	
	command.add('lfgcustom', (search,members) => {
		if(isNaN(members) && members!==undefined) command.message('(LFG Finder) Only input numbers for number of members')
		
		else {
			if(PRETEND_LEGIT && searchterms.length===0) pretendlegit()
			
			searchterms.push(search.toLowerCase())
			
			if (!isNaN(members)) searchno.push(parseInt(members))
			
			else {max(search.toLowerCase())}
			
			clearTimeout(timer)
			finder()
			command.message('(LFG Finder) Finding: '+search)
		}
	})
	
	
	command.add('lfgstop', arg => {
		if(arg===undefined) stopall()
		
		else {
			arg=arg.split(',')
			for(let term of arg) {
				if(searchterms.includes(term.toLowerCase())) {
					searchno.splice(searchterms.indexOf(term.toLowerCase()),1)
					searchterms.splice(searchterms.indexOf(term.toLowerCase()),1)
				}
			}
			command.message('(LFG Finder) Left searches:'+searchterms)
		}
		
		if(searchterms.length===0) {
			leadlist=[]
			clearTimeout(timer)
		}
	})
	
	command.add('lfglist', () => {
		command.message('(LFG Finder) Currently searching for '+searchterms)
	})
	
	
	/////Dispatches
	dispatch.hook('S_SHOW_PARTY_MATCH_INFO', 1, event => {
		if(searching && !windowopened) { 				//Do not notify if its because window is opened.
			messages.push.apply(messages,event.listings) //Array object cannot use concat.
			
			/*if(event.pageCount!==event.pageCurrent) {
				turnpage()
				return
			}
			else*/
			
			
			messages.forEach(post => {	//Hefty search but its needed for multiple arguments with objects.
				for(let i in searchterms) {
					if(post.message.toLowerCase().includes(searchterms[i]) && !leadlist.includes(post.leader) && post.playerCount<searchno[i]) {
						notification('Message: '+post.message+'\nLeader: '+post.leader+' ('+post.playerCount+'/'+searchno[i]+')')
						if(NO_REPEATS) leadlist.push(post.leader)
					}
				}
			})
			
			messages=[]
			searching=false
			if(PRETEND_LEGIT) dispatch.toServer('C_PARTY_MATCH_WINDOW_CLOSED',1,{})
		}
	})	
	
	dispatch.hook('C_REQUEST_PARTY_MATCH_INFO', 'raw', {filter:{fake:false}}, () => {
		if(PRETEND_LEGIT && !searching && !windowopened) { //while searching server will see it as your window is opened. This will close the window before allowing true opening.
			dispatch.toServer('C_PARTY_MATCH_WINDOW_CLOSED',1,{})
		}
			
		windowopened=true
	})
	
	dispatch.hook('C_PARTY_MATCH_WINDOW_CLOSED', 'raw', {filter:{fake:false}}, () => {
		windowopened=false
	})
	
	dispatch.hook('S_RETURN_TO_LOBBY', 'raw', () => { //clear all timer when switching characters
		stopall()
	})
	
	dispatch.hook('S_PARTY_MEMBER_LIST', 'raw', () => { //clear all timer and stuff when joining a party
		if(JOIN_PARTY_STOPS_SEARCH && searchterms.length!==0) stopall()
	})
	
	
	/////Functions
	function finder(){
		if(!searching && !windowopened) {
			if(PRETEND_LEGIT) pretendlegit()
			
			else {
				dispatch.toServer('C_REQUEST_PARTY_MATCH_INFO', 1, {
					unk1:0,
					minlvl:lowerRange,
					maxlvl:upperRange,
					unk2:3,
					unk3:0,
					purpose:'' //cannot use purpose well because of capitalization specific searching (TERA PLEASE)
				})
			}
			searching=true
			timer = setTimeout(finder, SEARCH_INTERVAL)
		}
		else
			timer = setTimeout(finder, TRY_AGAIN_INTERVAL)
	}
	
	function stopall() {
		clearTimeout(timer)
		command.message('(LFG Finder) All searches stopped')
		searchterms=[]
		searchno=[]
		leadlist=[]
	}
	
	function notification(msg) {
		notifier.notify({
			title: 'LFG Notification',
			message: msg,
			wait:false, 
			sound:soundId, 
		})
	}
		
		
	function max(term) {
		if(!CHECK_MAX_MEMBER) maxnumber=31
		
		else {
			maxnumber=5
			for(let i in raidList) {
				if(term.includes(raidList[i])) maxnumber=raidMaxNumber[i]
			}
		}
		
		searchno.push(maxnumber)
	}
	
	/*function turnpage() { //undefined
		dispatch.toServer('C_REQUEST_PARTY_MATCH_INFO_PAGE', 1, {})
	} */
	
	function pretendlegit() { //In Tera NA, opening the window send these packets in order. CRPMI,CRPMI,CRMPMI
		dispatch.toServer('C_REQUEST_PARTY_MATCH_INFO', 1, {
				unk1:0,
				minlvl:lowerRange,
				maxlvl:upperRange,
				unk2:3,
				unk3:0,
				purpose:''
		})
		dispatch.toServer('C_REQUEST_PARTY_MATCH_INFO', 1, {
				unk1:0,
				minlvl:lowerRange,
				maxlvl:upperRange,
				unk2:3,
				unk3:0,
				purpose:''
		})
		dispatch.toServer('C_REQUEST_MY_PARTY_MATCH_INFO', 1, {})
	}
}
