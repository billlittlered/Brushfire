import React, { Component } from 'react';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';
import './Cart.css';


import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import Paper from '@material-ui/core/Paper';
import Typography from '@material-ui/core/Typography';
import ButtonBase from '@material-ui/core/ButtonBase';

import ComplexGrid from './ComplexGrid';



class Cart extends Component {
    

    constructor(props) {
        super(props);
        

        this.state = 
        {
            productsInCart: null,
            message: '',
            subTotal: 0.00,
            grandTotal: 0.00,
            calculatedTax: 0.00,
            hasPurchased: false
        };

        this.handleBackToListClick = this.handleBackToListClick.bind(this);
        this.getProductsInCart = this.getProductsInCart.bind(this);
        this.handleRemoveFromCart = this.handleRemoveFromCart.bind(this);
        this.handlePurchaseClick = this.handlePurchaseClick.bind(this);

        const useStyles = makeStyles(theme => ({
            root: {
              flexGrow: 1,
            },
            paper: {
              padding: theme.spacing(2),
              margin: 'auto',
              maxWidth: 500,
            },
            image: {
              width: 128,
              height: 128,
            },
            img: {
              margin: 'auto',
              display: 'block',
              maxWidth: '100%',
              maxHeight: '100%',
            },
          }));

        
    }

    handleBackToListClick() {
        this.props.onClick();
    }

    componentDidMount() {
        this.getProductsInCart();
    }

    handlePurchaseClick() {
        

        fetch(`https://mybillfunctionapp2.azurewebsites.net/api/CompletePurchase`, {
            method: 'DELETE',
            headers: {
                Accept: 'application/json',
                'Content-Type': 'application/json',
              }
        })
        .then(result => result.text())
        .then(function(data) {
            console.log(data);
            this.setState( 
                {
                     message: '', 
                     hasPurchased: true 
                });  
        }.bind(this))
        .catch(function(err) {
            console.log('Error completing purchase');
            console.log(err);
            this.setState( { message: 'Error completing purchase' });
        }.bind(this));;
    }

    getProductsInCart() {
        fetch('https://mybillfunctionapp2.azurewebsites.net/api/GetProductsInCart')
        .then(response => response.json())
        .then(data => {
            this.setState( { productsInCart: data });
            if (data.length === 0){
                this.setState( { message: 'Empty cart' });
            }
            else {
                let runningTotal = 0.00;
                data.map((p) => {
                    runningTotal = runningTotal + (p.ProductDetails.Price * p.QuantityDesired);
                });
           
                const tax = .06;
                const tmpTax = runningTotal * tax;
                const tmpGrandTotal = tmpTax + runningTotal;
                this.setState( 
                    { 
                        subTotal: runningTotal, 
                        grandTotal: tmpGrandTotal,
                        calculatedTax: tmpTax
                    });
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
                {
                    this.state.hasPurchased? 
                        <div>
                            <h2 className="purchaseCompleteMessage">Congrats, puchase completed!</h2>
                            <h4>Items should arrive in 1-2 business days. Thank you!</h4>
                        </div>
                        :
                        <div>
                            <h3>{this.state.message}</h3>
                            <div>
                                {this.state.productsInCart && this.state.productsInCart.map(
                                        (p) =>
                                        <div>
                                            <img className="smallCartImage"
                                                src={require(`./images/${p.ProductDetails.ImageName}`)}
                                                alt={p.ProductDetails.Name}
                                            />
                                            <h3>{p.ProductDetails.Name}</h3>
                                            <h3>Qty: {p.QuantityDesired} x Price: {p.ProductDetails.Price} = ${p.QuantityDesired * p.ProductDetails.Price}</h3>
                                            <Button variant="contained" color="secondary" value={p.ProductId} onClick={this.handleRemoveFromCart} className="">
                                                Remove 
                                            </Button>
                                            <Divider className="customProductDivider"/>
                                        </div>
                                )
                            }
                            </div>
                            { this.state.productsInCart && this.state.productsInCart.length > 0?
                                <div>
                                    <h4>Sub Total: ${this.state.subTotal}</h4>
                                    <h4>Tax (6%): ${this.state.calculatedTax.toFixed(2)}</h4>
                                    <h3>Grand Total: ${this.state.grandTotal.toFixed(2)}</h3>
                                    <Button variant="contained" className="purchaseButton" onClick={this.handlePurchaseClick} className="purchaseButton">
                                        Purchase
                                    </Button>
                                </div>
                                :
                                <div></div>
                            }
                        </div>
                    }
            </div>
        )

    }

}

export default Cart;