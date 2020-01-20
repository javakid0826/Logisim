//Class for... well take a wild guess
class Wire {
	constructor(points, connections, paths) {
		this.connections = connections || [];
		this.points = points;
		this.paths = paths || [[...points]]; //Paths is just for rendering branching wires
		this.state = false;

		this.onChange = state => {
			this.state = state;
			for(let con of this.connections){
				con.wireUpdate(state);
			}
		}
	}
}
