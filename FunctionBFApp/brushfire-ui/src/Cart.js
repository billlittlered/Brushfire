import React, { Component } from 'react';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import './Cart.css';

class Cart extends Component {

    constructor(props) {
        super(props);

        this.state = 
        {
            productsInCart: null,
            message: ''
        };

        this.handleBackToListClick = this.handleBackToListClick.bind(this);
        this.getProductsInCart = this.getProductsInCart.bind(this);
        this.handleRemoveFromCart = this.handleRemoveFromCart.bind(this);
    }

    handleBackToListClick() {
        this.props.onClick();
    }

    componentDidMount() {
        this.getProductsInCart();
    }

    getProductsInCart() {
        fetch('https://mybillfunctionapp2.azurewebsites.net/api/GetProductsInCart')
        .then(response => response.json())
        .then(data => {
            this.setState( { productsInCart: data });
            if (data.length === 0){
                this.setState( { message: 'Empty cart' });
            }
        })
        .catch(function(err) {
            console.log(err);
        });
    }

    handleRemoveFromCart(evt) {
        const productId = evt.currentTarget.value;
        const qty = this.state.qty;

        fetch(`https://mybillfunctionapp2.azurewebsites.net/api/RemoveItem?productId=${productId}`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              }
        })
        .then(result => result.text())
        .then(data => {
            console.log(data);
            this.setState( { message: 'Product removed!' });            
        })
        .then(() => this.getProductsInCart())
        .catch(function(err) {
            console.log('Error removing product from cart');
            console.log(err);
            this.setState( { message: 'Error removing product from cart' });
        });;
    }

    render() {
        return (
            <div>
                <Button variant="contained" color="default" onClick={this.handleBackToListClick} className="addButton">
                    Back to List
                </Button>
                <h3>{this.state.message}</h3>
                {
                    this.state.productsInCart && this.state.productsInCart.map(
                            (p) =>
                            <div>
                                <img className="smallCartImage"
                                src={require(`./images/${p.ProductDetails.ImageName}`)}
                                alt={p.ProductDetails.Name}
                            />
                                <br />
                                <h3>{p.ProductDetails.Name}</h3>
                                <h3>Qty: {p.QuantityDesired}</h3>
                                <Button variant="contained" color="secondary" value={p.ProductId} onClick={this.handleRemoveFromCart} className="">
                                    Remove 
                                </Button>
                                <Divider className="customProductDivider"/>
                            </div>
                    )
                }
            </div>
        )

    }

}

export default Cart;