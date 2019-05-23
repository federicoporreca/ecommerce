const B = ReactBootstrap;
const url = "http://localhost:8080";

class Console extends React.Component {
    constructor(props) {
        super(props);
        this.state = { section: "Categories" };
        this.handleSwitch = this.handleSwitch.bind(this);
    }

    handleSwitch(section) {
        this.setState({ section: section });
    }

    render() {
        let console;
        switch (this.state.section) {
            case "Categories":
                console = <CategoryConsole />;
                break;
            case "Items":
                console = <ItemConsole />;
        }
        return (
            <React.Fragment>
                <Navbar brand="Console" links={["Categories", "Items"]} onSwitch={this.handleSwitch} />
                {console}
            </React.Fragment>
        );
    }
}

class Navbar extends React.Component {
    render() {
        return (
            <B.Navbar bg="dark" variant="dark">
                <B.Navbar.Brand>{this.props.brand}</B.Navbar.Brand>
                <B.Nav className="mr-auto">
                    {this.props.links.map((link) =>
                        <B.Nav.Link key={link} onClick={() => this.props.onSwitch(link)}>{link}</B.Nav.Link>)}
                </B.Nav>
            </B.Navbar>
        );
    }
}

class CategoryConsole extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            categories: [],
            categoryId: "",
            categoryName: "",
            categoryParent: {},
            showAddModal: false,
            showEditModal: false,
            showDeleteModal: false
        }
        this.handleToggleAddModal = this.handleToggleAddModal.bind(this);
        this.handleToggleEditModal = this.handleToggleEditModal.bind(this);
        this.handleToggleDeleteModal = this.handleToggleDeleteModal.bind(this);
        this.handleAdd = this.handleAdd.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
        this.fetchCategories = this.fetchCategories.bind(this);
    }

    componentDidMount() {
        this.fetchCategories();
    }

    fetchCategories() {
        fetch(url + "/categories")
            .then(response => response.json())
            .then(categories => {
                categories.forEach(category => this.addParent(category, true));
                return categories;
            })
            .then(categories => { this.setState({ categories: categories }) });
    }

    addParent(category, isRoot) {
        if (isRoot) {
            category.parent = {};
        }
        if (category.children.length > 0) {
            category.children.forEach(child => {
                child.parent = category;
                this.addParent(child, false);
            });
        }
    }

    handleToggleAddModal(parent) {
        this.setState({ showAddModal: !this.state.showAddModal, categoryParent: parent });
    }

    handleToggleEditModal(category) {
        this.setState({ showEditModal: !this.state.showEditModal, categoryName: category.name, categoryParent: category.parent });
    }

    handleToggleDeleteModal(category) {
        this.setState({ showDeleteModal: !this.state.showDeleteModal, selectedCategory: category });
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleAdd(category) {
        fetch(url + "/categories", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(category) })
            .then(this.fetchCategories);
        this.handleToggleAddModal({ parent: {} });
    }

    handleDelete(category) {
        fetch(url + "/categories/" + category.id, { method: "DELETE" })
            .then(this.fetchCategories);
        this.handleToggleDeleteModal({ parent: {} });
    }

    render() {
        return (
            <B.Container fluid>
                <B.Row>
                    <B.Col className="mt-3">
                        <B.Button onClick={() => this.handleToggleAddModal({ parent: {} })}>Add root</B.Button>
                    </B.Col>
                </B.Row>
                <B.Row>
                    <B.Col className="mt-3">
                        <CategoryList
                            categories={this.state.categories}
                            onAdd={this.handleToggleAddModal}
                            onEdit={this.handleToggleEditModal}
                            onDelete={this.handleToggleDeleteModal} />
                    </B.Col>
                </B.Row>
                <AddCategoryModal
                    show={this.state.showAddModal}
                    categoryParent={this.state.categoryParent}
                    onHide={this.handleToggleAddModal}
                    onConfirm={this.handleAdd} />
                <EditCategoryModal
                    show={this.state.showEditModal}
                    categoryName={this.state.categoryName}
                    categoryParent={this.state.categoryParent}
                    categories={this.state.categories}
                    onHide={this.handleToggleEditModal}
                    onChange={this.handleChange} />
                <DeleteCategoryModal
                    show={this.state.showDeleteModal}
                    category={this.state.selectedCategory}
                    onHide={this.handleToggleDeleteModal}
                    onConfirm={this.handleDelete} />
            </B.Container>
        );
    }
}

class CategoryList extends React.Component {
    renderChildren(category, padding) {
        return (
            category.children.map(child =>
                <React.Fragment key={child.id}>
                    <B.ListGroup.Item style={{ paddingLeft: padding }}>
                        {child.name}
                        <ButtonGroup onAdd={this.props.onAdd} onEdit={this.props.onEdit} onDelete={this.props.onDelete} category={child} />
                    </B.ListGroup.Item>
                    {this.renderChildren(child, padding + 20)}
                </React.Fragment>)
        )
    }

    render() {
        return (
            <React.Fragment>
                <B.ListGroup>
                    {this.props.categories.map(category =>
                        <React.Fragment key={category.id}>
                            <B.ListGroup.Item>
                                {category.name}
                                <ButtonGroup onAdd={this.props.onAdd} onEdit={this.props.onEdit} onDelete={this.props.onDelete} category={category} />
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
                <B.Button
                    variant="danger"
                    size="sm"
                    style={{ float: "right" }}
                    disabled={this.props.category.children.length !== 0}
                    onClick={() => this.props.onDelete(this.props.category)}>Delete</B.Button>
                <B.Button
                    size="sm"
                    style={{ float: "right", marginRight: 10 }}
                    onClick={() => this.props.onEdit(this.props.category)}>Edit</B.Button>
                <B.Button
                    size="sm"
                    style={{ float: "right", marginRight: 10 }}
                    onClick={() => this.props.onAdd(this.props.category)}>Add child</B.Button>
            </React.Fragment>
        );
    }
}

class AddCategoryModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = { categoryName: "" };
        this.handleChange = this.handleChange.bind(this);
        this.submitAndClear = this.submitAndClear.bind(this);
    }

    handleChange(event) {
        this.setState({ categoryName: event.target.value });
    }

    submitAndClear() {
        if (this.props.parent.id == null) {
            this.props.onConfirm({ name: this.state.name });
        } else {
            this.props.onConfirm({ name: this.state.name, parent: { id: this.props.parent.id } });
        }
        this.setState({ name: "" });
    }

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
            <B.Modal show={this.props.show} onHide={() => this.props.onHide({ parent: {} })}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Add category</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>
                    <B.Form>
                        <B.FormGroup>
                            <B.Form.Label>Name</B.Form.Label>
                            <B.Form.Control type="text" value={this.state.name} onChange={this.handleChange} />
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Parent</B.Form.Label>
                            <B.Form.Control plaintext readOnly defaultValue={this.props.parent.name}></B.Form.Control>
                        </B.FormGroup>
                    </B.Form>
                </B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={() => this.props.onHide({ parent: {} })}>Cancel</B.Button>
                    <B.Button onClick={this.submitAndClear}>Save</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class EditCategoryModal extends React.Component {
    renderChildren(category) {
        return (
            category.children.map(child =>
                <React.Fragment key={child.id}>
                    <option value={child}>{child.name}</option>
                    {this.renderChildren(child)}
                </React.Fragment>)
        );
    }

    render() {
        return (
            <B.Modal show={this.props.show} onHide={() => this.props.onHide({ parent: {} })}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Edit category</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>
                    <B.Form>
                        <B.FormGroup>
                            <B.Form.Label>Name</B.Form.Label>
                            <B.Form.Control type="text" name="name" value={this.props.categoryName} onChange={this.onChange} />
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Parent</B.Form.Label>
                            <B.Form.Control as="select" name="parent" value={this.props.categoryParent} onChange={this.onChange}>
                                <option></option>
                                {this.props.categories.map(category =>
                                    <React.Fragment key={category.id}>
                                        <option value={category}>{category.name}</option>
                                        {this.renderChildren(category)}
                                    </React.Fragment>)}
                            </B.Form.Control>
                        </B.FormGroup>
                    </B.Form>
                </B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={() => this.props.onHide({ parent: {} })}>Cancel</B.Button>
                    <B.Button>Save</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class DeleteCategoryModal extends React.Component {
    render() {
        return (
            <B.Modal show={this.props.show} onHide={() => this.props.onHide({ parent: {} })}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Delete category</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>Are you sure you want to delete "{this.props.category.name}"?</B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={() => this.props.onHide({ parent: {} })}>Cancel</B.Button>
                    <B.Button variant="danger" onClick={() => this.props.onConfirm(this.props.category)}>Delete</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class ItemConsole extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            items: [],
            currencies: [],
            selectedItem: { brand: {} },
            showAddItemModal: false,
            showDeleteItemModal: false
        }
        this.handleToggleAddItemModal = this.handleToggleAddItemModal.bind(this);
        this.handleToggleDeleteItemModal = this.handleToggleDeleteItemModal.bind(this);
        this.handleDelete = this.handleDelete.bind(this);
    }

    componentDidMount() {
        this.fetchItems();
        this.fetchCurrencies();
    }

    fetchItems() {
        fetch(url + "/items")
            .then(response => response.json())
            .then(items => this.setState({ items: items }));
    }

    fetchCurrencies() {
        fetch(url + "/currencies")
            .then(response => response.json())
            .then(currencies => this.setState({ currencies: currencies }));
    }

    handleToggleAddItemModal() {
        this.setState({ showAddItemModal: !this.state.showAddItemModal });
    }

    handleToggleDeleteItemModal(item) {
        this.setState({ showDeleteItemModal: !this.state.showDeleteItemModal, selectedItem: item });
    }

    handleDelete(item) {
        fetch(url + "/items/" + item.id, { method: "DELETE" })
            .then(this.fetchItems);
        this.handleToggleDeleteItemModal({ brand: {} });
    }

    render() {
        return (
            <B.Container fluid>
                <B.Row>
                    <B.Col className="mt-3">
                        <B.Button onClick={this.handleToggleAddItemModal}>Add</B.Button>
                    </B.Col>
                </B.Row>
                <B.Row>
                    <B.Col className="mt-3">
                        <ItemTable items={this.state.items} onDelete={this.handleToggleDeleteItemModal} />
                    </B.Col>
                </B.Row>
                <AddItemModal
                    show={this.state.showAddItemModal}
                    currencies={this.state.currencies}
                    onHide={this.handleToggleAddItemModal} />
                <DeleteItemModal
                    show={this.state.showDeleteItemModal}
                    item={this.state.selectedItem}
                    onHide={this.handleToggleDeleteItemModal}
                    onConfirm={this.handleDelete} />
            </B.Container>
        );
    }
}

class ItemTable extends React.Component {
    render() {
        return (
            <B.Table>
                <thead>
                    <tr>
                        <th>Brand</th>
                        <th>Name</th>
                        <th>EAN</th>
                        <th>Category</th>
                        <th></th>
                    </tr>
                </thead>
                <tbody>
                    {this.props.items.map(item =>
                        <tr key={item.id}>
                            <td>{item.brand.name}</td>
                            <td>{item.name}</td>
                            <td>{item.ean}</td>
                            <td>{item.category.name}</td>
                            <td style={{ whiteSpace: "nowrap", width: "0" }}>
                                <B.Button size="sm" style={{ marginRight: 10 }}>Edit</B.Button>
                                <B.Button variant="danger" size="sm" onClick={() => this.props.onDelete(item)}>Delete</B.Button>
                            </td>
                        </tr>)}
                </tbody>
            </B.Table>
        );
    }
}

class AddItemModal extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            brand: "",
            name: "",
            prices: [],
            ean: "",
            category: {}
        }
        this.handleChange = this.handleChange.bind(this);
        this.handleAddPrice = this.handleAddPrice.bind(this);
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    handleAddPrice(price) {
        this.setState({ prices: this.state.prices.push(price) });
    }

    render() {
        return (
            <B.Modal show={this.props.show} onHide={this.props.onHide}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Add item</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>
                    <B.Form>
                        <B.FormGroup>
                            <B.Form.Label>Brand</B.Form.Label>
                            <B.Form.Control type="text" name="brand" value={this.state.brand} onChange={this.handleChange} />
                        </B.FormGroup>
                        <B.FormGroup>
                            <B.Form.Label>Name</B.Form.Label>
                            <B.Form.Control type="text" name="name" value={this.state.name} onChange={this.handleChange} />
                        </B.FormGroup>
                        <PriceFormGroup prices={this.state.prices} currencies={this.props.currencies} onAdd={this.handleAddPrice} />
                    </B.Form>
                </B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={this.props.onHide}>Cancel</B.Button>
                    <B.Button>Save</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

class PriceFormGroup extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            value: "",
            currency: ""
        };
        this.handleChange = this.handleChange.bind(this);
    }

    handleChange(event) {
        this.setState({ [event.target.name]: event.target.value });
    }

    render() {
        return (
            <B.FormGroup>
                <B.Form.Label>Price</B.Form.Label>
                {this.props.prices.map(price =>
                    <B.Form.Row key={price.id}>
                        <B.Col>
                            <B.Form.Control plaintext readOnly defaultValue={price.value} />
                        </B.Col>
                        <B.Col>
                            <B.Form.Control plaintext readOnly defaultValue={price.currency} />
                        </B.Col>
                        <B.Col>
                            <B.Button variant="danger">Delete</B.Button>
                        </B.Col>
                    </B.Form.Row>)}
                <B.Form.Row>
                    <B.Col>
                        <B.Form.Control type="text" name="value" value={this.state.value} onChange={this.handleChange} />
                    </B.Col>
                    <B.Col>
                        <B.Form.Control as="select" name="currency" value={this.state.currency} onChange={this.handleChange}>
                            {this.props.currencies.map(currency =>
                                <option key={currency}>{currency}</option>)}
                        </B.Form.Control>
                    </B.Col>
                    <B.Col>
                        <B.Button onClick={() => this.props.onAdd({ value: this.state.value, currency: this.state.currency })}>Add</B.Button>
                    </B.Col>
                </B.Form.Row>
            </B.FormGroup>
        );
    }
}

class DeleteItemModal extends React.Component {
    render() {
        return (
            <B.Modal show={this.props.show} onHide={() => this.props.onHide({ brand: {} })}>
                <B.Modal.Header closeButton>
                    <B.Modal.Title>Delete item</B.Modal.Title>
                </B.Modal.Header>
                <B.Modal.Body>Are you sure you want to delete "{this.props.item.brand.name} {this.props.item.name}"?</B.Modal.Body>
                <B.Modal.Footer>
                    <B.Button onClick={() => this.props.onHide({ brand: {} })}>Cancel</B.Button>
                    <B.Button variant="danger" onClick={() => this.props.onConfirm(this.props.item)}>Delete</B.Button>
                </B.Modal.Footer>
            </B.Modal>
        );
    }
}

ReactDOM.render(
    <Console />, document.getElementById("container"));