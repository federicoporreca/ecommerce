var B = ReactBootstrap;

class Console extends React.Component {
    constructor() {
        super();
        this.state = { mode: "categories" };
        this.handleSwitchMode = this.handleSwitchMode.bind(this);
    }

    handleSwitchMode(mode) {
        this.setState({ mode: mode });
    }

    render() {
        switch (this.state.mode) {
            case "categories":
                return (
                    <React.Fragment>
                        <Navbar onSwitchMode={this.handleSwitchMode} />
                        <CategoryConsole />
                    </React.Fragment>
                );
            case "items":
                return (
                    <React.Fragment>
                        <Navbar onSwitchMode={this.handleSwitchMode} />
                        <ItemConsole />
                    </React.Fragment>
                );
        }
    }
}

class Navbar extends React.Component {
    render() {
        return (
            <B.Navbar bg="dark" variant="dark">
                <B.Navbar.Brand>Console</B.Navbar.Brand>
                <B.Nav className="mr-auto">
                    <B.Nav.Link onClick={() => this.props.onSwitchMode("categories")}>Categories</B.Nav.Link>
                    <B.Nav.Link onClick={() => this.props.onSwitchMode("items")}>Items</B.Nav.Link>
                </B.Nav>
            </B.Navbar>
        );
    }
}

class CategoryConsole extends React.Component {
    constructor() {
        super();
        this.state = {
            categories: [],
            selectedCategory: {},
            showAddModal: false,
            showDeleteModal: false
        }
        this.handleToggleAddModal = this.handleToggleAddModal.bind(this);
        this.handleToggleDeleteModal = this.handleToggleDeleteModal.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.refresh = this.refresh.bind(this);
    }

    componentDidMount() {
        this.refresh();
    }

    handleToggleAddModal(category) {
        console.log(category);
        this.setState({ showAddModal: !this.state.showAddModal, selectedCategory: category });
    }

    handleToggleDeleteModal(categoryId) {
        console.log(categoryId);
        this.setState({ showDeleteModal: !this.state.showDeleteModal, selectedCategory: {id: categoryId} });
    }

    handleDelete(categoryId) {
        fetch("http://localhost:8080/categories/" + categoryId, { method: "DELETE" })
            .then(this.refresh);
        this.handleToggleDeleteModal();
    }

    refresh() {
        fetch("http://localhost:8080/categories")
            .then(response => response.json())
            .then(categories => this.setState({ categories: categories }));
    }

    render() {
        return (
            <React.Fragment>
                <CategoryList categories={this.state.categories} onAdd={this.handleToggleAddModal} onDelete={this.handleToggleDeleteModal} />
                <AddModal show={this.state.showAddModal} selectedCategory={this.state.selectedCategory} categories={this.state.categories} onHide={this.handleToggleAddModal} />
                <DeleteModal show={this.state.showDeleteModal} selectedCategoryId={this.state.selectedCategory.id} onHide={this.handleToggleDeleteModal} onDelete={this.handleDelete} />
            </React.Fragment>
        );
    }
}

class CategoryList extends React.Component {
    handleAdd() {

    }

    handleEdit() {

    }

    renderChildren(category, padding) {
        return (
            category.children.map(child =>
                <React.Fragment key={child.id}>
                    <B.ListGroup.Item style={{ paddingLeft: padding }}>
                        {child.name}
                        <ButtonGroup onAdd={this.props.onAdd} onDelete={this.props.onDelete} category={child} />
                    </B.ListGroup.Item>
                    {this.renderChildren(child, padding + 20)}
                </React.Fragment>)
        )
    }

    render() {
        return (
            <React.Fragment>
                <B.Button onClick={this.props.onAdd}>Add root</B.Button>
                <B.ListGroup>
                    {this.props.categories.map(category =>
                        <React.Fragment key={category.id}>
                            <B.ListGroup.Item>
                                {category.name}
                                <ButtonGroup onAdd={this.props.onAdd} onDelete={this.props.onDelete} category={category} />
                            </B.ListGroup.Item>
                            {this.renderChildren(category, 40)}
                        </React.Fragment>)}
                </B.ListGroup>
            </React.Fragment>
        );
    }
}

class ButtonGroup extends React.Component {
    render() {
        return (
            <React.Fragment>
                <B.Button variant="danger" size="sm" style={{ float: "right" }} disabled={this.props.category.children.length !== 0} onClick={() => this.props.onDelete(this.props.category.id)}>Delete</B.Button>
                <B.Button size="sm" style={{ float: "right", marginRight: 10 }} onClick={this.handleShowEditModal}>Edit</B.Button>
                <B.Button size="sm" style={{ float: "right", marginRight: 10 }} onClick={() => this.props.onAdd(this.props.category)}>Add child</B.Button>
            </React.Fragment>
        );
    }
}

class AddModal extends React.Component {
    renderChildren(category) {
        return (
            category.children.map(child =>
                <React.Fragment key={child.id}>
                    <option value={child.id}>{child.name}</option>
                    {this.renderChildren(child)}
                </React.Fragment>)
        );
    }

    render() {
        return (
            <B.Modal show={this.props.show} onHide={() => this.props.onHide({})}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Add category</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>
                    <B.Form>
                        <B.FormGroup>
                            <B.Form.Label>Name</B.Form.Label>
                            <B.Form.Control type="text" />
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Parent</B.Form.Label>
                            <B.Form.Control as="select" value={this.props.selectedCategory.id}>
                                {this.props.categories.map(category =>
                                    <React.Fragment key={category.id}>
                                        <option value={category.id}>{category.name}</option>
                                        {this.renderChildren(category)}
                                    </React.Fragment>)}
                            </B.Form.Control>
                        </B.FormGroup>
                    </B.Form>
                </B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={() => this.props.onHide({})}>Cancel</B.Button>
                    <B.Button>Save</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class DeleteModal extends React.Component {
    render() {
        return (
            <B.Modal show={this.props.show} onHide={() => this.props.onHide(undefined)}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Delete category</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>Are you sure?</B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={() => this.props.onHide(undefined)}>Cancel</B.Button>
                    <B.Button variant="danger" onClick={() => this.props.onDelete(this.props.selectedCategoryId)}>Delete</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class ItemConsole extends React.Component {
    render() {
        return (
            <React.Fragment>
                <ItemForm />
                <ItemTable />
            </React.Fragment>
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
            .then(response => response.json())
            .then(items => this.setState({ items: items }));
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
                    {this.state.items.map(item =>
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