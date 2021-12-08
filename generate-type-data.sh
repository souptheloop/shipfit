#!/bin/bash

scriptPath=$(dirname $0)
sqliteDb=${1?"usage is ./generate-type-data.sh <sqlite_database>"}

ships=$(sqlite3 $sqliteDb << EOF
       select json_object('typeID', typeID, 'categoryID',  categoryID, 'typeName', typeName)
        from invTypes
        join invGroups on invTypes.groupID=invGroups.groupID
        where categoryID=6
        or categoryID=65;
EOF)

shipArr=$(echo $ships | jq -s .)
echo "export var Ships = $shipArr" > $scriptPath/data/ships.ts

modules=$(sqlite3 $sqliteDb << EOF
select json_object('typeID', invTypes.typeID, 'typeName', typeName, 'effectID', effectID) from invTypes
       join dgmTypeEffects on invTypes.typeID=dgmTypeEffects.typeID
       where dgmTypeEffects.effectID = 11
       or dgmTypeEffects.effectID = 12
       or dgmTypeEffects.effectID = 13
       or dgmTypeEffects.effectID = 2663
       or dgmTypeEffects.effectID = 3772
       or dgmTypeEffects.effectID = 6306
       ;
EOF)

moduleArr=$(echo $modules | jq -s .)
echo "export var Modules = $moduleArr" > $scriptPath/data/modules.ts