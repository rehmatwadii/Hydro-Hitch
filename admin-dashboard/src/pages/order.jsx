import { Helmet } from 'react-helmet-async';
import ProductOrderPage from 'src/sections/order/order-view';

// ----------------------------------------------------------------------

export default function UserPage() {
    return (
        <>
            <Helmet>
                <title> Order | hydrohitch </title>
            </Helmet>

            <ProductOrderPage />
        </>
    );
}
