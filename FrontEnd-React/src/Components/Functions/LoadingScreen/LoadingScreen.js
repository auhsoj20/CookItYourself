import React from 'react';
import { ClipLoader } from 'react-spinners';

function LoadingScreen() {
    var override;
    override = 'display: block; margin: 20 auto; border-color: red ';

    return (
        <div className="App">
            <div className="LoadingScreen">
                <ClipLoader color={"#000000"} loading={true} css={override} size={150} />
                {/* 404 - No Page Found Text kann optional hinzugefügt werden */}
                <p>Loading</p>
            </div>
        </div>
    );
}

export default LoadingScreen;