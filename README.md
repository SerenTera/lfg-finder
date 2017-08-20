# lfg-finder
A tera proxy module to notify if an lfg that you want appears, searching continously till you join a party or you stop it on its own. 

Has 2 versions: one with tera-notifier support and one warning just using ingame sound. Please read the infomation carefully. This module uses to Server packets and thus carries some risk, similar to other modules that also dispatches to server.

This Branch is for: tera-notifier version. REQUIRES tera-notifier and uses it to notify you. If you do not wish to use tera-notifier, use 'master' branch instead.

Requires (READ carefully!):
- Commands module by Pinkie-Pie
- tera-notifier module: https://github.com/SerenTera/tera-notifier
- `C_REQUEST_PARTY_MATCH_INFO.1.def` file. Put the provided .def file in the module folder into 'tera-proxy\node_modules\tera-data\protocol' folder, unless the pull request into the main tera-data repo has been accepted. You must do this!

## Commands
Type commands in '/proxy' chat or use '!' prefix in other chat channels.

- `lfgrange (lower range) (higherrange)`: Changes the level range to search. Default is 60-65
- `lfgfind (search1,search2,search3,...)`: Start Searches for these search terms. Separate out each search term with ','. For example, if I want to search for vhhm,mm and vs(no preference for nm or hm), I would type 'lfgfind vhhm,mm,vs'.
- `lfgcustom (search) (max member)`: Start search for a term with customized number of members. If I want to search for say, a custom string that would have only 30 max members, i would type 'lfgcustom argon 30', and it will search for lfgs with argons in the message and members which is less than 30.
- `lfgstop (string1,string2,string3,...)`: Stop searches for this search term. Only stops if it is previously added, and spelling must be exact. For example, if i want to stop searching for vhhm and mm only, leaving vs search still active, i would type 'lfgstop vhhm,mm'
- `lfgstop`: Typing this command without arguments stops all searches for lfg immediately. USE THIS COMMAND once u entered a dungeon/party for now, until I implement the method to auto stop searches upon joining a party.
- `lfglist`: List out all the current search queries entered.

## Settings in index.js
### Defaults in index.js are as follows:
- `NO_REPEATS=true`: No continual repetition notifications from previously informed parties, based on leader to differentiate. In other words, Only one notification per party lead

- `PRETEND_LEGIT=true`: Pretend you are legitimately searching with window open. Very experimental and this does not mean totally risk-free. Set to true to try it out. false if you do not care lul

- `SEARCH_INTERVAL=30000`: Default interval to search for lfgs. In milsecs. (default=30000ms=30s) Aka searches every this often.

- `TRY_AGAIN_INTERVAL=200`: Default interval to retry search for lfg if previous search fail. Put a small delay for this or just leave it as it is. (It is unnatural for you to search multiple times before the initial search has returned to your pc)
- `CHECK_MAX_MEMBER=true`: true to check if the party is already full for that dungeon. Checks uses 'Raid Maximum Member Numbers' or 5 members if not defined. 
- `JOIN_PARTY_STOPS_SEARCH=true`: true to stop searching once you enter a party automatically.

### 'Raid Maximum Member Numbers' in index.js:
This helps to automatically define the maximum party member in a party when `CHECK_MAX_MEMBER` is set to true.
```
const raidList=['ab','vh','ai','hh','rally','event'],	//List out the normally used terms for raids here (ONLY RAIDS)
      raidMaxNumber=[7,7,10,20,30,30]				        	//List out corresponding raid max member number
```    
From the above, you can see how you should add your own list in. If the dungeon only needs 5 person then you do not add it in. index of name in Raid list must correspond to index in raid max number.

### Other settings
- lowerRange=60,: Lower Level range to search for
- upperRange=65,: Upper Level range to search for
- soundId='Notification.IM': Use true for default windows notification sound. Or use false for silence. For Custom id strings, read: http://msdn.microsoft.com/en-us/library/windows/apps/hh761492.aspx

## Example
Typing 'lfgfind ai' and then waiting for an lfg will yield this with default settings if there is such a lfg that is not full party:
![lfg](http://i.imgur.com/wZOu8mA.jpg)

After which you just need to apply to it. The search should stop on its own upon joining party, look out for a message that says all searches stopped, else use `lfgstop` without arguments.
## Other infomation
- This module is slightly risky because it uses packets that is sent to server. Attempts to mask it should not be taken as 100% effective. 
- This module is in initial stages and might contain alot of bugs
- Might cause slight lags due to the heavy parsing and searching needed?

## To do
- Implement auto stop searching upon joining a party.
- Bug fixes
