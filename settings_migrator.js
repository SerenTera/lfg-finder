"use strict"

const DefaultSettings = {
	"NO_REPEATS":true,			
	"PRETEND_LEGIT":true,
	"SEARCH_INTERVAL":30000,
	"TRY_AGAIN_INTERVAL":200,
	"CHECK_MAX_MEMBER":true,
	"JOIN_PARTY_STOPS_SEARCH":true,  
	"lowerRange":60,
	"upperRange":65,
	"soundId":"Notification.IM",
	"raidList":{
		"rg":3,
		"hh":20,
		"rally":30,
		"event":30
	}
}

module.exports = function MigrateSettings(from_ver, to_ver, settings) {
    if (from_ver === undefined) {
        // Migrate legacy config file
        return Object.assign(Object.assign({}, DefaultSettings), settings);
    } else if (from_ver === null) {
        // No config file exists, use default settings
        return DefaultSettings;
    } else {
        // Migrate from older version (using the new system) to latest one
        throw new Error('So far there is only one settings version and this should never be reached!');
    }
}