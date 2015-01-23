{
    init: function(elevators, floors) {
        var go = { up: {}, down: {} };

        var goingUp = function(elevator) {
            elevator.goingUpIndicator(true);
            elevator.goingDownIndicator(false);
        }
        var goingDown = function(elevator) {
            elevator.goingUpIndicator(false);
            elevator.goingDownIndicator(true);
        }

        _.each(elevators, function(elevator) {
            elevator.destinations = {};

            goingUp(elevator); // start by going up
            elevator.on("idle", function() {
                minUpDest = _.min(elevator.destinations);
                if (minUpDest === Infinity) {
                    // no destinations left
                    goingDown(elevator);
                    elevator.goToFloor(elevator.currentFloor());
                    elevator.goToFloor(0);
                } else {
                    // bring people up
                    goingUp(elevator);
                    delete go.up[minUpDest];
                    elevator.goToFloor(minUpDest);
                }
            });

            elevator.on("floor_button_pressed", function(floorNum) {
                //console.log("elevator button pressed for floor: " + floorNum);
                elevator.destinations[floorNum] = floorNum;
            });

            elevator.on("passing_floor", function(floorNum, direction) {
                //console.log("passing floor " + floorNum + ", going " + direction + ", loaded " + elevator.loadFactor());
                if (direction === "down" && elevator.loadFactor() < 0.7 && floorNum in go.down) {
                    elevator.goToFloor(floorNum, true);
                    delete go.down[floorNum];
                }
                if (direction === "up" && elevator.loadFactor() < 0.7 && floorNum in go.up) {
                    elevator.goToFloor(floorNum, true);
                    delete go.up[floorNum];
                }
            });

            elevator.on("stopped_at_floor", function(floorNum) {
                if (floorNum === 0) {
                    goingUp(elevator);
                }

                delete elevator.destinations[floorNum];
                if (elevator.goingUpIndicator()) {
                    delete go.up[floorNum];
                }
                if (elevator.goingDownIndicator()) {
                    delete go.down[floorNum];
                }
                //console.log("stopped at floor " + floorNum + ", with remaining destinations: ", elevator.destinations);
            });
        });

        _.each(floors, function(floor) {
            var floorNum = floor.floorNum();
            floor.on("up_button_pressed", function() {
                //console.log("up pressed on floor: " + floorNum);
                go.up[floorNum] = floorNum;
            });
            floor.on("down_button_pressed", function() {
                //console.log("down pressed on floor: " + floorNum);
                go.down[floorNum] = floorNum;
            });
        });
    },
    update: function(dt, elevators, floors) {
        // We normally don't need to do anything here
    }
}
