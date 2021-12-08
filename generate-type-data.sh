#!/bin/bash

scriptPath=$(dirname $0)
sqliteDb=${1?"usage is ./generate-type-data.sh <sqlite_database>"}

ships=$(sqlite3 $sqliteDb << EOF
select json_object(
  'typeID', invTypes.typeID,
  'categoryID', invGroups.categoryID,
  'typeName', invTypes.typeName,
  'lows', lows.valueFloat,
  'mids', mids.valueFloat,
  'highs', highs.valueFloat,
  'rigs', rigs.valueFloat,
  'services', coalesce(services.valueFloat, 0)
)
from invTypes
  left join (select * from dgmTypeAttributes where dgmTypeAttributes.attributeID=12) as lows on lows.typeID=invTypes.typeID
  left join (select * from dgmTypeAttributes where dgmTypeAttributes.attributeID=13) as mids on mids.typeID=invTypes.typeID
  left join (select * from dgmTypeAttributes where dgmTypeAttributes.attributeID=14) as highs on highs.typeID=invTypes.typeID
  left join (select * from dgmTypeAttributes where dgmTypeAttributes.attributeID=1137) as rigs on rigs.typeID=invTypes.typeID
  left join (select * from dgmTypeAttributes where dgmTypeAttributes.attributeID=2056) as services on services.typeID=invTypes.typeID
  join invGroups on invTypes.groupID=invGroups.groupID
where invGroups.categoryID=6
or invGroups.categoryID=65
;
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