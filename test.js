var _ = require('lodash');

var nearestBeaconQueue = [
    {
        instanceId: '100'
    },
    {
        instanceId: '200'
    },
    {
        instanceId: '100'
    },
    {
        instanceId: '100'
    },
    {
        instanceId: '200'
    },
    {
        instanceId: '500'
    },
    {
        instanceId: '200'
    },
    {
        instanceId: '200'
    },

];

console.log('nearestBeacon: ' + getNearestBeaconFromQueue(nearestBeaconQueue).instanceId);

function getNearestBeaconFromQueue(nearestBeaconQueue) {

    // sort by instance id
    let sortedByBeaconId = _.sortBy(nearestBeaconQueue, ['instanceId']);

    // make a map with a counter for each instance id
    let nearestBeaconDataMap = new Map();
    let prevBeacon = undefined;
    _.forEach(sortedByBeaconId, (beacon) => {
        if (prevBeacon === undefined || beacon.instanceId !== prevBeacon.instanceId) {
            nearestBeaconDataMap[beacon.instanceId] = 1;
        } else {
            nearestBeaconDataMap[beacon.instanceId] = nearestBeaconDataMap[beacon.instanceId] + 1;
        }
        prevBeacon = beacon;
    });

    // find the highest count
    let nearestBeaconInstanceId = undefined;
    let highestBeaconCounter = 0;
    for (var key in nearestBeaconDataMap) {
        if (nearestBeaconDataMap[key] > highestBeaconCounter) {
            nearestBeaconInstanceId = key;
            highestBeaconCounter = nearestBeaconDataMap[key];
        }
    };

    // return the beacon with the highest count
    _.forEach(nearestBeaconQueue, (beacon) => {
        if (beacon.instanceId === nearestBeaconInstanceId) {
            return beacon;
        }
    });

    return _.find(nearestBeaconQueue, (beacon) => {
        return beacon.instanceId === nearestBeaconInstanceId;
    });
}