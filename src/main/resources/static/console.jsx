import Table from 'react-bootstrap/Table';

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
            <Table striped bordered hover>
                <thead>
                    <th>Brand</th>
                    <th>Name</th>
                    <th>EAN</th>
                    <th>Category</th>
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
            </Table>
        );
    }
}

ReactDOM.render(<ItemTable/>, document.getElementById("container"));