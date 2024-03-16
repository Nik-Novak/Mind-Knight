console.log('INIT client.js');
$(document).ready( async (event) => {
    const currentURL = window.location.href;
    const baseUrl = currentURL.split('/').slice(0, 3).join('/');
    console.log(baseUrl);
    let response = await fetch(baseUrl + '/qr-code');
    let { url } = await response.json();
    console.log('FETCHED URL', url);

    let qrImg = $('<img>');
    qrImg.attr('src', url);
    qrImg.attr('alt', 'QR Code');
    qrImg.attr('width', '100');
    qrImg.attr('height', '100');

    

    $('#qr-code-container').append(qrImg);
    // $('#qr-code-container').append('<p>(view on another device)</p>');
});