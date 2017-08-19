const Command = require('command')

//Defaults
const NO_REPEATS=true,			//No continual repetition notifications from previously informed parties, based on leader to differentiate.
	  PRETEND_LEGIT=false,		//Pretend you are legitimately searching with window open. Very experimental and this does not mean totally risk-free lul.
	  SEARCH_INTERVAL=30000,	//Default interval to search for lfgs. In milsecs. (default=30000ms=30s)
	  TRY_AGAIN_INTERVAL=200,	//Default interval to retry search for lfg if previous search fail. Put a small delay for this. (It is unnatural for you to search multiple times before the initial search has returned to your pc) 
	  CHECK_MAX_MEMBER=true		//Check if the raid has max number of members already, and prevent notification if so. False sets max member to 31.
	  
let lowerRange=60,				//Lower Level range to search for
	upperRange=65,				//Upper Level range to search for
	soundId=4002				//Sound ID of warning
	
	
//Raid Maximum Member Numbers
const raidList=['ab','vh','ai','hh','rally','event']	//List out the normally used terms for raids here (ONLY RAIDS)
const raidMaxNumber=[7,7,10,20,30,30]					//List out corresponding raid max member number

module.exports = function lfgfinder(dispatch) {
	const command = Command(dispatch)
	
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
		if(PRETEND_LEGIT && searchterms.length===0) pretendlegit()
		
		if(args===undefined) leadlist=[] //reset leadlist if no argument
		
		args=args.split(',')
		
		for(let term of args) {
			max(term.toLowerCase())
			searchterms.push(term.toLowerCase())
		}
		
		clearTimeout(timer)
		finder()
		command.message('(LFG Finder) Finding these: '+args)
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
		if(arg===undefined) {
			clearTimeout(timer)
			command.message('(LFG Finder) All searches stopped')
			searching=false
			searchterms=[]
			searchno=[]
			leadlist=[]
		}
		
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
		
		if(PRETEND_LEGIT && searchterms.length===0) {
			searching=false
			leadlist=[]
			clearTimeout(timer)
			dispatch.toServer('C_PARTY_MATCH_WINDOW_CLOSED',1,{})
		}
	})
	
	command.add('lfglist', () => {
		command.message('(LFG Finder) Currently searching for '+searchterms)
	})
	
	
	/////Dispatches
	dispatch.hook('S_SHOW_PARTY_MATCH_INFO', 1, event => {
		if(searching && !windowopened) { //Do not notify if its because window is opened.
			messages.push.apply(messages,event.listings) //Array object cannot use concat.
			
			/*if(event.pageCount!==event.pageCurrent) {
				turnpage()
				return
			}
			else*/
			
			console.log(JSON.stringify(messages))
			
			messages.forEach(post => {	//Hefty search but its needed for multiple arguments with objects.
				for(let i in searchterms) {
					if(post.message.toLowerCase().includes(searchterms[i]) && !leadlist.includes(post.leader) && post.playerCount<searchno[i]) {
						command.message('(LFG Finder)Leader:'+post.leader+' Message:'+post.message+' ('+post.playerCount+'/'+searchno[i]+')')
						sound()
						if(NO_REPEATS) leadlist.push(post.leader)
					}
				}
			})
			
			messages=[]
			searching=false
		}
	})	
	
	dispatch.hook('C_REQUEST_PARTY_MATCH_INFO', 'raw', fake => {
		if(!fake) {
			if(PRETEND_LEGIT && searchterms.length!==0 && !windowopened) {
				dispatch.toServer('C_PARTY_MATCH_WINDOW_CLOSED',1,{})
			}
			
			windowopened=true
		}
	})
	
	dispatch.hook('C_PARTY_MATCH_WINDOW_CLOSED', 'raw', fake => {
		if(!fake) {
			if(PRETEND_LEGIT && searchterms.length!==0 && windowopened) {
				pretendlegit()
			}
			
			windowopened=false
		}
	})
	
	dispatch.hook('S_RETURN_TO_LOBBY', 'raw', code => { //clear all timer when switching characters
		clearTimeout(timer)
		searchterms=[]
		searchno=[]
	})
	
	/////Functions
	function finder(){
		if(!searching && !windowopened) {
			dispatch.toServer('C_REQUEST_PARTY_MATCH_INFO', 1, {
				unk1:0,
				minlvl:lowerRange,
				maxlvl:upperRange,
				unk2:3,
				unk3:0,
				purpose:'' //cannot use purpose well because of capitalization specific searching (TERA PLEASE)
			})
			searching=true
			timer = setTimeout(finder, SEARCH_INTERVAL)
		}
		else
			timer = setTimeout(finder, TRY_AGAIN_INTERVAL)
	}
	
	
	function sound() {
		dispatch.toClient('S_PLAY_EVENT_SOUND', 1, {
			id: soundId,
			unk1: 1,
			unk2: 1
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
				levelRangeLow:60,
				levelRangeHigh:65,
				unk2:3,
				unk3:0,
				purpose:''
		})
		dispatch.toServer('C_REQUEST_PARTY_MATCH_INFO', 1, {
				unk1:0,
				levelRangeLow:60,
				levelRangeHigh:65,
				unk2:3,
				unk3:0,
				purpose:''
		})
		dispatch.toServer('C_REQUEST_MY_PARTY_MATCH_INFO', 1, {})
	}
}
