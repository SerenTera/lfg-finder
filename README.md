# lfg-finder
A tera proxy module to notify if an lfg that you want appears, searching continously till you join a party or you stop it on its own. 

Current version: 2.0.0

## Update
Update: If you updated win10 recently to Fall creators update, update tera-notifier: https://github.com/SerenTera/tera-notifier

Update History:

 - 1.0.0 : Initial Module
 - 2.0.0 : Added Auto update
## General Info
Has 2 versions: one with tera-notifier support and one warning just using ingame sound. Please read the infomation carefully. This module uses to Server packets and thus carries some risk, similar to other modules that also dispatches to server.

This Branch is for: tera-notifier version. REQUIRES tera-notifier and uses it to notify you. If you do not wish to use tera-notifier, use 'sound' branch instead.

Requires (READ carefully!):
- Commands module by Pinkie-Pie
- tera-notifier module: https://github.com/SerenTera/tera-notifier

Supports:
 - Caali's Proxy (Auto Update)
 
## Config
Settings are in config.json, if not available, it will be automatically generated on your first login based on defaults.

### Defaults in index.js are as follows:
- `NO_REPEATS=true`: No continual repetition notifications from previously informed parties, based on leader to differentiate. In other words, Only one notification per party lead

- `PRETEND_LEGIT=true`: Pretend you are legitimately searching with window open. Very experimental and this does not mean totally risk-free. Set to true to try it out. false if you do not care lul

- `SEARCH_INTERVAL=30000`: Default interval to search for lfgs. In milsecs. (default=30000ms=30s) Aka searches every this often.

- `TRY_AGAIN_INTERVAL=200`: Default interval to retry search for lfg if previous search fail. Put a small delay for this or just leave it as it is. (It is unnatural for you to search multiple times before the initial search has returned to your pc)

- `CHECK_MAX_MEMBER=true`: true to check if the party is already full for that dungeon. Checks uses 'Raid Maximum Member Numbers' or 5 members if not defined. 

- `JOIN_PARTY_STOPS_SEARCH=true`: true to stop searching once you enter a party automatically.

### 'Raid Maximum Member Numbers' in index.js:
This helps to automatically define the maximum party member in a party when `CHECK_MAX_MEMBER` is set to true.
From the Setting, when your search contains the term, then the number of maximum member will be changed accordingly. For example, when ur search term contains hh, then the maximum member will be set to 20, and after which, the module will not warn you.

### Other settings
- `lowerRange=60`: Lower Level range to search for
- `upperRange=65`: Upper Level range to search for
- `soundId='Notification.IM'`: Use true for default windows notification sound. Or use false for silence. For Custom id strings, read: http://msdn.microsoft.com/en-us/library/windows/apps/hh761492.aspx
 
## Commands
Type commands in '/proxy' chat or use '!' prefix in other chat channels.

To start searching for LFGs:
- `lfg find (search1,search2,search3,...)`: Start Searches for these search terms. Separate out each search term with ','. For example, if I want to search for vhhm,mm and vs(no preference for nm or hm), type 'lfg find vhhm,mm,vs'.
- `lfg custom (search) (max member)`: Start search for a term with customized number of members. If I want to search for say, a custom string that would have only 30 max members, type 'lfg custom argon 30', and it will search for lfgs with argons in the message and members which is less than 30.

To stop searching for LFGs:
- `lfg stop (string1,string2,string3,...)`: Stop searches for this search term. Only stops if it is previously added, and spelling must be exact. For example, to stop searching for vhhm and mm only, leaving vs search still active,  type 'lfg stop vhhm,mm'
- `lfg stop`: Typing this command without arguments stops all searches for lfg immediately. Search should stop immediately on joining any party, if it does not, use this command.

Other convienent commands:
- `lfg range (lower range) (higherrange)`: Changes the level range to search. Default is 60-65
- `lfg list`: List out all the current search queries entered.


## Example
Typing 'lfg find ai' and then waiting for an lfg will yield this with default settings if there is such a lfg that is not full party:
![lfg](http://i.imgur.com/wZOu8mA.jpg)

After which you just need to apply to it. The search should stop on its own upon joining party, look out for a message that says all searches stopped, else use `lfg stop` without arguments.
## Other infomation
- This module is slightly risky because it uses packets that is sent to server. Attempts to mask it should not be taken as 100% effective. 
- This module is in initial stages and might contain alot of bugs
- Might cause slight lags due to the heavy parsing and searching needed?

## To do
- Bug fixes
