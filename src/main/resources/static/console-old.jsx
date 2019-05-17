class Console extends React.Component {
    constructor() {
        super();
        this.state = {mode: "categories"};
        this.handleSwitch = this.handleSwitch.bind(this);
    }
    handleSwitch(event) {
        this.setState({mode: event.target.id});
    }
    render() {
        switch (this.state.mode) {
            case "categories":
                return (
                    <div>
                        <Navbar handleSwitch={this.handleSwitch}/>
                        <CategoryConsole/>
                    </div>
                );
            case "items":
                return (
                    <div>
                        <Navbar handleSwitch={this.handleSwitch}/>
                        <ItemForm/>
                        <ItemTable/>
                    </div>
                );
        }
    }
}

class Navbar extends React.Component {
    constructor(props) {
        super(props);
    }
    render() {
        return (
            <nav className="navbar navbar-expand-lg navbar-light bg-light">
                <a className="navbar-brand">Admin console</a>
                <button className="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
                    <span className="navbar-toggler-icon"></span>
                </button>
                <div className="collapse navbar-collapse" id="navbarSupportedContent">
                    <ul className="navbar-nav mr-auto">
                        <li className="nav-item">
                            <a className="nav-link" href="#" id="categories" onClick={this.props.handleSwitch}>Categories</a>
                        </li>
                        <li className="nav-item">
                            <a className="nav-link" href="#" id="items" onClick={this.props.handleSwitch}>Items</a>
                        </li>
                    </ul>
                </div>
            </nav>
        );
    }
}

class CategoryConsole extends React.Component {
    render() {
        return (
            <p>Category console</p>
        );
    }
}

class ItemForm extends React.Component {
    render() {
        return (
            <form>
                <div className="form-group">
                    <label>Brand</label>
                    <input type="text" className="form-control"/>
                </div>
                <div className="form-group">
                    <label>Name</label>
                    <input type="text" className="form-control"/>
                </div>
                <button type="submit" className="btn btn-primary">Submit</button>
            </form>
        );
    }
}

class ItemTable extends React.Component {
    constructor(props) {
        super(props);
        this.state = {items: []};
    }
    componentDidMount() {
        fetch("http://localhost:8080/items")
            .then((response) => response.json())
            .then((items) => this.setState({items: items}));
    }
	render() {
		return (
            <table className="table">
                <thead>
                    <tr>
                        <th scope="col">Brand</th>
                        <th scope="col">Name</th>
                        <th scope="col">EAN</th>
                        <th scope="col">Category</th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.items.map((item) => 
                        <tr key={item.id}>
                            <td>{item.brand.name}</td>
                            <td>{item.name}</td>
                            <td>{item.ean}</td>
                            <td>{item.category.name}</td>
                        </tr>)}
                </tbody>
            </table>
        );
	}
}

ReactDOM.render(<Console/>, document.getElementById("container"));