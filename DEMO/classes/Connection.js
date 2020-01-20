//Class for the little black squares off of the components that wires connect to
class Connection {
	constructor(updateCB, position) {
		this.wire; //The connected wire
		this.updateCB = updateCB; //The callback for what to do when updating

		this.col = new Collider(position[0], position[1], CS, CS);

		this.parentUpdate = state => {
			//Check if the connected wire is actually a wire
			if(this.wire instanceof Wire){
				this.wire.onChange(state);
			}
		}

		this.wireUpdate = state => {
			this.updateCB(state);
		}
	}
}
