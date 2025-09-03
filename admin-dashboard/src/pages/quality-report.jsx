import { Helmet } from 'react-helmet-async';

import { QualityReportView } from 'src/sections/qualityReport/view';

// ----------------------------------------------------------------------

export default function QualityReport() {
    return (
        <>
            <Helmet>
                <title> Quality Report | hydrohitch</title>
            </Helmet>

            <QualityReportView />
        </>
    );
}
