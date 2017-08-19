# lfg-finder
A tera proxy module to notify if an lfg that you want appears. Has 2 versions: one with tera-notifier support and one warning just using ingame sound. Please read the infomation carefully. This module uses to Server packets and thus carries some risk, similar to other modules that also dispatches to server.

This Branch is for: NON tera-notifier version. NO SUPPORT FOR tera-notifier. Uses ingame sounds to alert you instead.

Requires: Commands module by Pinkie-Pie

## Settings in index.js
### Defaults in index.js are as follows:
- NO_REPEATS=true: No continual repetition notifications from previously informed parties, based on leader to differentiate. In other words, Only one notification per party lead

- PRETEND_LEGIT=true: Pretend you are legitimately searching with window open. Very experimental and this does not mean totally risk-free. Set to true to try it out.

- SEARCH_INTERVAL=30000: Default interval to search for lfgs. In milsecs. (default=30000ms=30s) Aka searches every this often.

- TRY_AGAIN_INTERVAL=200: Default interval to retry search for lfg if previous search fail. Put a small delay for this or just leave it as it is. (It is unnatural for you to search multiple times before the initial search has returned to your pc)
- CHECK_MAX_MEMBER=true: true to check if the party is already full for that dungeon. Checks uses 'Raid Maximum Member Numbers' or 5 members if not defined. 

### 'Raid Maximum Member Numbers' in index.js:
This helps to automatically define the maximum party member in a party when `CHECK_MAX_MEMBER` is set to true.
```
const raidList=['ab','vh','ai','hh','rally','event'],	//List out the normally used terms for raids here (ONLY RAIDS)
      raidMaxNumber=[7,7,10,20,30,30]				        	//List out corresponding raid max member number
```    
From the above, you can see how you should add your own list in. If the dungeon only needs 5 person then you do not add it in. index of name in Raid list must correspond to index in raid max number.

### Other settings
- lowerRange=60,: Lower Level range to search for
-	upperRange=65,: Upper Level range to search for
-	soundId=4002: Sound ID of warning. Go [Here](https://docs.google.com/spreadsheets/d/1Inba-tW70grzqisvpdFPpKFfgz5XTptFygjUNb1T1hw/edit?usp=sharing) to find more sound ids. Credits to hugedong69 (https://github.com/hugedong69/Spawner) for this.

## Commands
Type commands in '/proxy' chat or use '!' prefix in other chat channels.

`lfgrange (lower range) (higherrange)`: Changes the level range to search. Default is 60-65
`lfgfind (search1,search2,search3,...)`: Start Searches for these search terms. Separate out each search term with ','. For example, if I want to search for vhhm,mm and vs(no preference for nm or hm), I would type 'lfgfind vhhm,mm,vs'.
`lfgcustom (search) (max member)`: Start search for a term with customized number of members. If I want to search for say, a custom string that would have only 30 max members, i would type 'lfgcustom argon 30', and it will search for lfgs with argons in the message and members which is less than 30.
`lfgstop (string1,string2,string3,...)`: Stop searches for this search term. Only stops if it is previously added, and spelling must be exact. For example, if i want to stop searching for vhhm and mm only, leaving vs search still active, i would type 'lfgstop vhhm,mm'
`lfgstop`: Typing this command without arguments stops all searches for lfg immediately. USE THIS COMMAND once u entered a dungeon/party for now, until I implement the method to auto stop searches upon joining a party.
`lfglist`: List out all the current search queries entered.

## Other infomation
- This module is slightly risky because it uses packets that is sent to server. Attempts to mask it should not be taken as 100% effective. 
- This module is in initial stages and might contain alot of bugs
- Might cause slight lags due to the heavy parsing and searching needed?

## To do
- Implement auto stop searching upon joining a party.
- Bug fixes
