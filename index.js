//Configs are in config.json. If not found, it will be automatically generated on first login. Refer to readme for info
const Notifier = require('tera-notifier'),
	  path = require('path'),
	  fs = require('fs'),
	  defaultConfig = require('./lib/configDefault.json')


module.exports = function lfgfinder(mod) {
	const notifier = Notifier(mod)
	
	
	let messages=[],
		searchterms=[],
		searchno=[],
		leadlist=[],
		maxnumber,
		timer=null,
		searching=false,
		windowopened=false,
		fileopen = true,
		stopwrite,
		config,
		NO_REPEATS,
		PRETEND_LEGIT,
		SEARCH_INTERVAL,
		TRY_AGAIN_INTERVAL,
		CHECK_MAX_MEMBER,
		JOIN_PARTY_STOPS_SEARCH,
		lowerRange,
		upperRange,
		soundId,
		raidList
	
	try{
		config = JSON.parse(fs.readFileSync(path.join(__dirname,'config.json'), 'utf8'))
		if(config.moduleVersion !== defaultConfig.moduleVersion) {
			let oldList = JSON.parse(JSON.stringify(config.raidList)),
				newList = JSON.parse(JSON.stringify(defaultConfig.raidList))
			Object.assign(newList,oldList) //Clone nested object raidList
			config = Object.assign({},defaultConfig,config,{moduleVersion:defaultConfig.moduleVersion,raidList:newList})
			saveconfig()
			console.log('[LFG FINDER] Updated new config file. Current settings transferred over.')
		}
		init()
	}
	catch(e){
		config = defaultConfig
		saveconfig()
		init()
		console.log('[LFG FINDER] Initated a new config file due to missing config file. Add your default config in config.json.')
	}	

	
	/////Commands
	mod.command.add('lfg', {
		$default() {
			mod.command.message('Invalid Command. Use "lfg info" for help')
		},
		info() {
			mod.command.message('Commands:lfg (argument)\nArgument available are:\nrange lower higher\nfind <args>\ncustom <pharse> <member number>\nstop <arg>\nlist')
		},
		range(lower,higher) {
			lowerRange=parseInt(lower)
			upperRange=parseInt(higher)
			mod.command.message(' Level range set to '+lower+' to '+higher)
		},
	
		find(args) { //investigate later how to use ...args 
			if(args===undefined) leadlist=[] //reset leadlist if no argument
		
			args=args.split(',')
		
			for(let term of args) {
				max(term.toLowerCase())
				searchterms.push(term.toLowerCase())
			}
		
			clearTimeout(timer)
			finder()
			mod.command.message(' Current Search: '+searchterms)
		},
	
		custom(search,members) {
			if(isNaN(members) && members!==undefined) mod.command.message(' Only input numbers for number of members')
		
			else {
				if(PRETEND_LEGIT && searchterms.length===0) pretendlegit()
			
				searchterms.push(search.toLowerCase())
			
				if (!isNaN(members)) searchno.push(parseInt(members))
			
				else {max(search.toLowerCase())}
			
				clearTimeout(timer)
				finder()
				mod.command.message(' Finding: '+search)
			}
		},
	
	
		stop(arg) {
			if(arg===undefined) stopall()
		
			else {
				arg=arg.split(',')
				for(let term of arg) {
					if(searchterms.includes(term.toLowerCase())) {
						searchno.splice(searchterms.indexOf(term.toLowerCase()),1)
						searchterms.splice(searchterms.indexOf(term.toLowerCase()),1)
					}
				}
				mod.command.message(' Left searches:'+searchterms)
			}
		
			if(searchterms.length===0) {
				leadlist=[]
				clearTimeout(timer)
			}
		},
	
		list() {
			mod.command.message(' Currently searching for '+searchterms)
		}
	})
	
	
	/////Dispatches
	mod.hook('S_SHOW_PARTY_MATCH_INFO', 1, event => {
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
			if(PRETEND_LEGIT) mod.send('C_PARTY_MATCH_WINDOW_CLOSED',1,{})
		}
	})	
	
	mod.hook('C_REQUEST_PARTY_MATCH_INFO', 'raw', {filter:{fake:false}}, () => {
		if(PRETEND_LEGIT && !searching && !windowopened) { //while searching server will see it as your window is opened. This will close the window before allowing true opening.
			mod.send('C_PARTY_MATCH_WINDOW_CLOSED',1,{})
		}
			
		windowopened=true
	})
	
	mod.hook('C_PARTY_MATCH_WINDOW_CLOSED', 'raw', {filter:{fake:false}}, () => {
		windowopened=false
	})
	
	mod.hook('S_RETURN_TO_LOBBY', 'raw', () => { //clear all timer when switching characters
		stopall()
	})
	
	mod.hook('S_PARTY_MEMBER_LIST', 'raw', () => { //clear all timer and stuff when joining a party
		if(JOIN_PARTY_STOPS_SEARCH && searchterms.length!==0) stopall()
	})
	
	
	/////Functions
	function finder(){
		if(!searching && !windowopened) {
			if(PRETEND_LEGIT) pretendlegit()
			
			else {
				mod.send('C_REQUEST_PARTY_MATCH_INFO', 1, {
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
		mod.command.message(' All searches stopped')
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
			for(let key of Object.keys(raidList)) {
				if(term.includes(key)) maxnumber=raidList[key]
			}
		}
		
		searchno.push(maxnumber)
	}
	
	/*function turnpage() { //undefined
		mod.toServer('C_REQUEST_PARTY_MATCH_INFO_PAGE', 1, {})
	} */
	
	function pretendlegit() { //In Tera NA, opening the window send these packets in order. CRPMI,CRPMI,CRMPMI
		mod.send('C_REQUEST_PARTY_MATCH_INFO', 1, {
				unk1:0,
				minlvl:lowerRange,
				maxlvl:upperRange,
				unk2:3,
				unk3:0,
				purpose:''
		})
		mod.send('C_REQUEST_PARTY_MATCH_INFO', 1, {
				unk1:0,
				minlvl:lowerRange,
				maxlvl:upperRange,
				unk2:3,
				unk3:0,
				purpose:''
		})
		mod.send('C_REQUEST_MY_PARTY_MATCH_INFO', 1, {})
	}
	
	function saveconfig() {
		if(fileopen) {
			fileopen = false
			fs.writeFile(path.join(__dirname,'config.json'), JSON.stringify(config,null,"\t"), err => {
				if(err) console.log('(ChangeEveryone) Error writing file, attempting to rewrite. If message persist, restart game and proxy')
				else fileopen = true
			})
		}
		else {
			clearTimeout(stopwrite)  //if file still being written
			stopwrite = setTimeout(saveconfig(),2000)
			return
		}
	}
	
	function init() {
		({NO_REPEATS,PRETEND_LEGIT,SEARCH_INTERVAL,TRY_AGAIN_INTERVAL,CHECK_MAX_MEMBER,JOIN_PARTY_STOPS_SEARCH,lowerRange,upperRange,soundId,raidList} = config)
	}
	
	
}
