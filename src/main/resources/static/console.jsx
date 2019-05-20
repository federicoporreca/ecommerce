var B = ReactBootstrap;

class Console extends React.Component {

    constructor() {
        super();
        this.state = { section: "Categories" };
        this.handleSwitchSection = this.handleSwitchSection.bind(this);
    }

    handleSwitchSection(event) {
        this.setState({ section: event.target.text });
    }

    render() {
        switch (this.state.section) {
            case "Categories":
                return (
                    <div>
                        <Navbar onSwitchSection={this.handleSwitchSection} />
                        <CategoryList />
                    </div>
                );
            case "Items":
                return (
                    <div>
                        <Navbar onSwitchSection={this.handleSwitchSection} />
                        <ItemForm />
                        <ItemTable />
                    </div>
                );
        }
    }

}

class Navbar extends React.Component {

    render() {
        return (
            <B.Navbar bg="light">
                <B.Navbar.Brand>Console</B.Navbar.Brand>
                <B.Nav className="mr-auto">
                    <B.Nav.Link onClick={this.props.onSwitchSection}>Categories</B.Nav.Link>
                    <B.Nav.Link onClick={this.props.onSwitchSection}>Items</B.Nav.Link>
                </B.Nav>
            </B.Navbar>
        );
    }

}

class CategoryList extends React.Component {

    constructor() {
        super();
        this.state = {
            categories: [],
            selectedCategory: {},
            showEditModal: false,
            showDeleteModal: false
        }
        this.handleDelete = this.handleDelete.bind(this);
        this.handleShowEditModal = this.handleShowEditModal.bind(this);
        this.handleCloseEditModal = this.handleCloseEditModal.bind(this);
        this.handleShowDeleteModal = this.handleShowDeleteModal.bind(this);
        this.handleCloseDeleteModal = this.handleCloseDeleteModal.bind(this);
    }

    componentDidMount() {
        this.refresh();
    }

    handleAdd() {

    }

    handleEdit() {

    }

    handleDelete(categoryId) {
        fetch("http://localhost:8080/categories/" + categoryId, { method: "DELETE" });
        this.refresh();
    }

    handleShowEditModal() {
        this.setState({ showEditModal: true });
    }

    handleCloseEditModal() {
        this.setState({ showEditModal: false });
    }

    handleShowDeleteModal(categoryId, event) {
        this.setState({ selectedCategory: {id: categoryId}, showDeleteModal: true });
    }

    handleCloseDeleteModal() {
        this.setState({ showDeleteModal: false });
    }

    refresh() {
        fetch("http://localhost:8080/categories")
            .then((response) => response.json())
            .then((categories) => this.setState({ categories: categories }));
    }

    renderChildren(category, padding) {
        return (
            category.children.map((child) =>
                <div key={child.id}>
                    <B.ListGroup.Item style={{ paddingLeft: padding }}>
                        {child.name}
                        <B.Button variant="danger" size="sm" style={{ float: "right" }} onClick={this.handleShowDeleteModal.bind(this, child.id)}>Delete</B.Button>
                        <B.Button size="sm" style={{ float: "right", marginRight: 10 }} onClick={this.handleShowEditModal}>Edit</B.Button>
                        <B.Button size="sm" style={{ float: "right", marginRight: 10 }} onClick={this.handleAdd}>Add child</B.Button>
                    </B.ListGroup.Item>
                    {this.renderChildren(child, padding + 20)}
                </div>)
        )
    }

    render() {
        return (
            <div>
                <B.ListGroup>
                    {this.state.categories.map((category) =>
                        <div key={category.id}>
                            <B.ListGroup.Item>
                                {category.name}
                                <B.Button variant="danger" size="sm" style={{ float: "right" }} onClick={this.handleShowDeleteModal.bind(this, category.id)}>Delete</B.Button>
                                <B.Button size="sm" style={{ float: "right", marginRight: 10 }} onClick={this.handleShowEditModal}>Edit</B.Button>
                                <B.Button size="sm" style={{ float: "right", marginRight: 10 }} onClick={this.handleAdd}>Add child</B.Button>
                            </B.ListGroup.Item>
                            {this.renderChildren(category, 40)}
                        </div>)}
                </B.ListGroup>
                <EditModal show={this.state.showEditModal} onHide={this.handleCloseEditModal} onConfirm={this.handleDelete} />
                <DeleteModal selectedCategory={this.state.selectedCategory} show={this.state.showDeleteModal} onHide={this.handleCloseDeleteModal} onConfirm={this.handleDelete} />
            </div>
        );
    }

}

class EditModal extends React.Component {
    render() {
        return (
            <B.Modal show={this.props.show} onHide={this.props.onHide}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Edit category</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>
                    Name
                    <B.Form.Control type="text" />
                    Parent
                    
                </B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={this.props.onHide}>Cancel</B.Button>
                    <B.Button onClick={this.props.onConfirm}>Save</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class DeleteModal extends React.Component {
    render() {
        return (
            <B.Modal show={this.props.show} onHide={this.props.onHide}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Delete category</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>Are you sure?</B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={this.props.onHide}>Cancel</B.Button>
                    <B.Button variant="danger" onClick={this.props.onConfirm.bind(this, this.props.selectedCategory.id)}>Delete</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class ItemForm extends React.Component {

    render() {
        return (
            <p>Item form</p>
        );
    }

}

class ItemTable extends React.Component {

    constructor(props) {
        super(props);
        this.state = { items: [] };
    }

    componentDidMount() {
        fetch("http://localhost:8080/items")
            .then((response) => response.json())
            .then((items) => this.setState({ items: items }));
    }

    render() {
        return (
            <B.Table>
                <thead>
                    <tr>
                        <th>Brand</th>
                        <th>Name</th>
                        <th>EAN</th>
                        <th>Category</th>
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
            </B.Table>
        );
    }

}

ReactDOM.render(<Console />, document.getElementById("container"));