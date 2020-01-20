//Class for a general component, aka anything that has a connection on it (gates, inputs, outputs, etc.)
class Component {
	constructor(position = [0, 0], type) {
		this.type = type;
		this.state = false;
		this.col = new Collider(position[0], position[1], CS * 5, CS * 5);
		this.conStates = [0, 0]; //The states of the connections
		this.cons = [[], []]; //The connections themselves

		this.updatePos = newPos => {
			let diff = newPos.sub(this.col.pos);
			this.col.pos = newPos;
			for(let conA of this.cons){
				for(let con of conA){
					con.col.pos = con.col.pos.add(diff);
				}
			}
		}
	}
}

class Gate extends Component {
	constructor(position = [0, 0], type) {
		super(position, type);
		//Check the type and return the corresponding function
		//The function in question is the operation that it performs on the inputs
		const findProcess = type => {
			switch (type) {
				case "AND":
					return((a, b) => a && b);
				case "OR":
					return((a, b) => a || b);
				case "XOR":
					return((a, b) => a ^ b);
				case "NAND":
					return((a, b) => !(a && b));
				case "NOR":
					return((a, b) => !(a || b));
				case "XNOR":
					return((a, b) => !(a ^ b));
			}
		}
		this.process = findProcess(type);

		this.update = (state, conNum) => {
			this.conStates[conNum] = state;

			this.state = this.process(this.conStates[0], this.conStates[1]);
			this.cons[1][0].parentUpdate(this.state);
		}

		//Manually add all the connections in their appropriate spots to the array
		//TODO: figure out a better way to do this because this is doodoo
		this.cons[0].push(new Connection(state => this.update(state, 0), [this.col.pos.x - CS, this.col.pos.y]));
		this.cons[0].push(new Connection(state => this.update(state, 1), [this.col.pos.x - CS, this.col.pos.y + CS * 4]));
		this.cons[1].push(new Connection(() => {}, [this.col.pos.x + CS * 5, this.col.pos.y + CS * 2]));
	}
}

class Input extends Component {
	constructor(position) {
		super(position, "INPUT");

		this.click = () => {
			this.state = !this.state;
			this.cons[0][0].parentUpdate(this.state);
		}

		this.col = new Collider(position[0], position[1], CS * 3, CS * 3);

		this.cons = [[new Connection(() => {}, [this.col.pos.x + CS * 3, this.col.pos.y + CS])]];
	}
}
