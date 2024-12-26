// Custom Loader Element Node
var loader = document.createElement('div')
loader.setAttribute('id', 'pre-loader');
loader.innerHTML = "<div class='lds-hourglass'></div>";

// Loader Start Function
window.start_loader = function() {
    if (!document.getElementById('pre-loader') || (!!document.getElementById('pre-loader') && document.getElementById('pre-loader').length <= 0))
        document.querySelector('body').appendChild(loader)
}

// Loader Stop Function
window.end_loader = function() {
    if (!!document.getElementById('pre-loader')) {
        setTimeout(() => {
            document.getElementById('pre-loader').remove()
        }, 500)
    }
}

var prod_ajax, products, listed, total = 0,
    change = 0;

function product_actions(_this, data) {
    var form = $("#add-form")
    _this.click(function() {
        form.find('input[name="name"]').val(data.name)
        form.find('input[name="price"]').val(data.price)
        $('#pname').text(data.name)
        $('#pprice').text(parseFloat(data.price).toLocaleString('en-US'))
        $('#find-product').val('').trigger('input')
    })

}

function update_total() {
    $('#total-amount').text(parseFloat(total).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 }))
    $('#checkout-amount').val(parseFloat(total).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 }))
}

function load_products() {
    if (prod_ajax) {
        prod_ajax.abort()
    }
    find_prod_ajax = $.ajax({
        url: './product_json.json',
        dataType: 'json',
        error: err => {
            alert('An error occurred.')
            console.error(err)
        },
        success: function(resp) {
            products = resp
            $('#product-result').html('')
            Object.keys(resp).map(k => {
                var item = $($('noscript#prod-item-clone').html()).clone()
                item.find('.prod_name').text(resp[k].name)
                item.find('.prod_price').text(parseFloat(resp[k].price).toLocaleString('en-US'))
                item.find('.prod_price').attr('data-id', resp[k].price)
                $('#product-result').append(item)
                product_actions(item, resp[k])
            })
        }
    })
}

function check_items() {
    if ($("#item-list tbody").is(':empty') == true) {
        $('#noItem').removeClass('d-none')
    } else {
        if ($('#noItem').hasClass('d-none') == false)
            $('#noItem').addClass('d-none');
    }
}

function item_actions(_this, key) {
    _this.find('.rem-item').click(function() {
        if (!!listed[key]) {
            _this.remove()
            delete listed[key];
            listed = Object.keys(listed).map(k => { return listed[k] != null ? listed[k] : false })
            localStorage.setItem('listed', JSON.stringify(listed))
        }
        check_items()
        load_list()
    })
    _this.find('.qty').on('change input', function() {
        if (!!listed[key]) {
            listed[key].qty = $(this).val()
            localStorage.setItem('listed', JSON.stringify(listed))
        }
        load_list()
    })
}

function load_list() {
    listed = !!localStorage.getItem('listed') ? $.parseJSON(localStorage.getItem('listed')) : [];
    total = 0;
    $('#item-list tbody').html('')
    if (Object.keys(listed).length > 0) {
        Object.keys(listed).map((k) => {
            var item = $($('noscript#item-tr-clone').html()).clone()
            item.find('.qty').val(parseFloat(listed[k].qty))
            item.find('.item-name').text(listed[k].product)
            item.find('.item-price').text(parseFloat(listed[k].price).toLocaleString('en-US'))
            item.find('.item-total').text(parseFloat(parseFloat(listed[k].price) * parseFloat(listed[k].qty)).toLocaleString('en-US'))
            total += parseFloat(listed[k].price) * parseFloat(listed[k].qty);
            $('#item-list tbody').append(item)
            item_actions(item, k)
            update_total()
        })
    }
    check_items()
}

// function loadReports() {
//     const reports = JSON.parse(localStorage.getItem('reports')) || [];
//     const reportList = $('#report-list');
//     reportList.html('');  // Clear previous data

//     if (reports.length === 0) {
//         $('#no-report').show();
//     } else {
//         $('#no-report').hide();
//         reports.forEach((report, index) => {
//             report.items.forEach(item => {
//                 const row = `
//                     <tr>
//                         <td>${index + 1}</td>
//                         <td>${report.date}</td>
//                         <td>${item.product}</td>
//                         <td class="text-end">${item.qty}</td>
//                         <td class="text-end">${parseFloat(item.price).toFixed(2)}</td>
//                         <td class="text-end">${parseFloat(item.total).toFixed(2)}</td>
//                     </tr>
//                 `;
//                 reportList.append(row);
//             });
//         });
//     }
// }

function loadReports() {
    const reports = JSON.parse(localStorage.getItem('reports')) || [];
    const reportList = $('#report-list');
    let totalQuantity = 0;
    let totalSales = 0, saleWOEggs = 0, saleWEggs = 0;
    let offerEggSales = 0, normalEggSales = 0;

    reportList.html(''); // Clear the previous report

    if (reports.length === 0) {
        $('#no-report').show();
    } else {
        $('#no-report').hide();

        reports.forEach((report, index) => {
            report.items.forEach(item => {
                const itemTotal = parseFloat(item.qty * item.price).toFixed(2);
                if (item.product != 'Offer Egg' && item.product != 'Normal Egg') {
                    totalQuantity += parseFloat(item.qty);
                    saleWOEggs += parseFloat(itemTotal);
                } 
                else {
                    if (item.product == 'Offer Egg') {
                        offerEggSales += parseFloat(item.qty);
                    } else if (item.product == 'Normal Egg') {
                        normalEggSales += parseFloat(item.qty);
                    }
                    saleWEggs += parseFloat(itemTotal);
                }
                totalSales += parseFloat(itemTotal);

                const row = `
                    <tr>
                        <td style="text-align: center;">${index + 1}</td>
                        <td>${report.date}</td>
                        <td>${item.product}</td>
                        <td style="text-align: right;">${item.qty}</td>
                        <td style="text-align: right;">${parseFloat(item.price).toFixed(2)}</td>
                        <td style="text-align: right;">${itemTotal}</td>
                    </tr>
                `;
                reportList.append(row);
            });
        });

        // Update Total Quantity and Total Sales on the page
        $('#total-quantity').text(totalQuantity);
        $('#total-sales').text(totalSales.toFixed(2));
        $('#total-normal-eggs').text(normalEggSales);
        $('#total-offer-eggs').text(offerEggSales);
        $('#total-sale-eggs').text(saleWEggs);
        $('#total-sale-wo-eggs').text(saleWOEggs);
    }
}


// function printReports() {
//     const reports = JSON.parse(localStorage.getItem('reports')) || [];

//     if (reports.length === 0) {
//         alert('No reports to print.');
//         return;
//     }

//     // Generate HTML content for printing
//     let printContent = `
//         <div style="text-align: center;">
//             <h1>Sales Report</h1>
//             <p>${new Date().toLocaleString()}</p>
//         </div>
//         <table border="1" cellspacing="0" cellpadding="8" style="width: 100%; border-collapse: collapse;">
//             <thead>
//                 <tr style="background-color: #4CAF50; color: white;">
//                     <th>#</th>
//                     <th>Date</th>
//                     <th>Product</th>
//                     <th>Quantity</th>
//                     <th>Price</th>
//                     <th>Total</th>
//                 </tr>
//             </thead>
//             <tbody>
//     `;

//     reports.forEach((report, index) => {
//         report.items.forEach(item => {
//             printContent += `
//                 <tr>
//                     <td style="text-align: center;">${index + 1}</td>
//                     <td>${report.date}</td>
//                     <td>${item.product}</td>
//                     <td style="text-align: right;">${item.qty}</td>
//                     <td style="text-align: right;">${parseFloat(item.price).toFixed(2)}</td>
//                     <td style="text-align: right;">${parseFloat(item.total).toFixed(2)}</td>
//                 </tr>
//             `;
//         });
//     });

//     printContent += `
//             </tbody>
//         </table>
//     `;

//     // Open a new window for printing
//     const printWindow = window.open('', '_blank', 'width=800,height=600');
//     printWindow.document.write(`
//         <html>
//             <head>
//                 <title>Sales Report</title>
//                 <style>
//                     body { font-family: Arial, sans-serif; margin: 20px; }
//                     table { width: 100%; border-collapse: collapse; }
//                     th, td { border: 1px solid #ddd; padding: 8px; }
//                     th { background-color: #4CAF50; color: white; }
//                 </style>
//             </head>
//             <body>${printContent}</body>
//         </html>
//     `);

//     printWindow.document.close();
//     printWindow.focus();
//     setTimeout(() => {
//         printWindow.print();
//         printWindow.close();
//     }, 500);
// }

function printReports() {
    const reports = JSON.parse(localStorage.getItem('reports')) || [];

    if (reports.length === 0) {
        alert('No reports to print.');
        return;
    }

    let totalQuantity = 0; // Track the total quantity sold
    let totalSales = 0, saleWOEggs = 0, saleWEggs = 0;
    let offerEggSales = 0, normalEggSales = 0;

    // Generate HTML content for printing
    let printContent = `
        <div style="text-align: center; width: 58mm; font-size: small;">
            <h2 style="margin: 0;">Sales Report</h2>
            <p>${new Date().toLocaleString()}</p>
            <hr>
        </div>
        <table style="width: 100%; border-collapse: collapse; font-size: small;">
            <thead>
                <tr>
                    <th style="text-align: left;">#</th>
                    <th style="text-align: left;">Product</th>
                    <th style="text-align: right;">Qty</th>
                    <th style="text-align: right;">Price</th>
                    <th style="text-align: right;">Total</th>
                </tr>
            </thead>
            <tbody>
    `;

    // Loop through reports and calculate totals
    reports.forEach((report, index) => {
        report.items.forEach(item => {
            const itemTotal = parseFloat(item.qty * item.price).toFixed(2);
            if (item.product != 'Offer Egg' && item.product != 'Normal Egg') {
                totalQuantity += parseFloat(item.qty);
                saleWOEggs += parseFloat(itemTotal);
            } 
            else {
                if (item.product == 'Offer Egg') {
                    offerEggSales += parseFloat(item.qty);
                } else if (item.product == 'Normal Egg') {
                    normalEggSales += parseFloat(item.qty);
                }
                saleWEggs += parseFloat(itemTotal);
            }
            totalSales += parseFloat(itemTotal); // Accumulate total sales

            printContent += `
                <tr>
                    <td style="text-align: left;">${index + 1}</td>
                    <td style="text-align: left;">${item.product}</td>
                    <td style="text-align: right;">${item.qty}</td>
                    <td style="text-align: right;">${parseFloat(item.price).toFixed(2)}</td>
                    <td style="text-align: right;">${itemTotal}</td>
                </tr>
            `;
        });
    });

    printContent += `
            </tbody>
        </table>
        <hr>
        <div style="text-align: right; font-size: small;">
            <p>Total Normal Eggs: ${normalEggSales}</p>
            <p>Total Offer Eggs: ${offerEggSales}</p>
            <p>Total Meat Quantity: ${totalQuantity}</p>
            <p>Egg Sales: ${saleWEggs}</p>
            <p>Meat Sales: ${saleWOEggs}</p>
            <p>Total Sales: ${totalSales.toFixed(2)}</p>
        </div>
    `;

    // Open a new window for printing
    const printWindow = window.open('', '_blank', 'width=240,height=400');
    printWindow.document.write(`
        <html>
            <head>
                <title>Sales Report</title>
                <style>
                    body { font-family: Arial, sans-serif; margin: 5px; width: 58mm; }
                    table { width: 100%; border-collapse: collapse; }
                    th, td { padding: 5px; font-size: small; }
                    th { text-align: left; }
                    hr { border: 0.5px solid #000; }

                    @media print {
                        body {
                            height: auto;
                            overflow: visible;
                            page-break-inside: avoid;
                        }
                    }
                </style>
            </head>
            <body>${printContent}</body>
        </html>
    `);

    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
        printWindow.print();
        printWindow.close();
    }, 500);
}

function quickLoadProduct(productName, quantity) {
    const defaultProductName = productName;
    const defaultQuantity = quantity; 
    const product = products.find(p => p.name === defaultProductName);
    if (!product) {
        alert(`Product "${defaultProductName}" not found.`);
        return;
    }
    listed.push({ product: product.name, price: product.price, qty: defaultQuantity });
    localStorage.setItem('listed', JSON.stringify(listed));
    load_list();
}

function getNextBillNumber() {
    let billNumber = localStorage.getItem('billNumber') || 1;
    billNumber = parseInt(billNumber);
    localStorage.setItem('billNumber', billNumber + 1);
    return billNumber;
}

function generateToken() {
    const billNumber = getNextBillNumber();
    // return 'M2M-' + billNumber.toString().padStart(6, '0'); // Example: M2M-000001
    return 'M2M-' + billNumber.toString(); // Example: M2M-000001
}


$(function() {
    check_items()
    load_list()
    loadReports();
    var load_prod = new Promise((resolve) => {
        load_products()
        resolve()
    })
    console.log(load_prod)
    load_prod.then(() => {
        end_loader()
    })
    $('#find-product').on('input', function() {
        var search = $(this).val().toLowerCase()
        if (search == '') {
            if (!$('#product-result').hasClass('d-none'))
                $('#product-result').addClass('d-none');
            return false;
        }
        $('#product-result').removeClass('d-none');
        $('#product-result .prod-item').each(function() {
            var name = $(this).find('.prod_name').text().toLowerCase()
            if (name.includes(search) === true) {
                $(this).toggle(true)
            } else {
                $(this).toggle(false)
            }

        })

    })
    
    $('#wsHalf').click(function() { 
        quickLoadProduct("Chicken W Skin", 0.5);
    })
    $('#wsOne').click(function() { 
        quickLoadProduct("Chicken W Skin", 1);
    })
    $('#wsOneAndHalf').click(function() { 
        quickLoadProduct("Chicken W Skin", 1.5);
    })
    $('#wsTwo').click(function() { 
        quickLoadProduct("Chicken W Skin", 2);
    })
    $('#wsThree').click(function() { 
        quickLoadProduct("Chicken W Skin", 3);
    })
    $('#wsFive').click(function() { 
        quickLoadProduct("Chicken W Skin", 5);
    })

    $('#wosHalf').click(function() { 
        quickLoadProduct("Chicken W/O Skin", 0.5);
    })
    $('#wosOne').click(function() { 
        quickLoadProduct("Chicken W/O Skin", 1);
    })
    $('#wosOneAndHalf').click(function() { 
        quickLoadProduct("Chicken W/O Skin", 1.5);
    })
    $('#wosTwo').click(function() { 
        quickLoadProduct("Chicken W/O Skin", 2);
    })
    $('#wosThree').click(function() { 
        quickLoadProduct("Chicken W/O Skin", 3);
    })
    $('#wosFive').click(function() { 
        quickLoadProduct("Chicken W/O Skin", 5);
    })

    $('#add-form').submit(function(e) {
        e.preventDefault()
        start_loader()
        var _this = $(this)
        var product = _this.find('[name="name"]').val()
        var price = _this.find('[name="price"]').val()
        var qty = _this.find('[name="qty"]').val()
        listed[listed.length] = { product: product, price: price, qty: qty }
        localStorage.setItem('listed', JSON.stringify(listed))
        _this[0].reset()
        _this.find('[name="name"]').val('')
        _this.find('[name="price"]').val('')
        $('#pname').text('')
        $('#pprice').text('')
        load_list()
        end_loader()
    })

    $('#checkout').click(function() {
        $('#checkoutModal').modal('show')
        $('#checkoutModal').on('shown.bs.modal', function() {
            $('#checkout-tendered').focus()
            $('#checkout-tendered').on('change input', function() {
                var pay = $(this).val()
                change = parseFloat(pay) - parseFloat(total)
                $('#checkout-change').val(parseFloat(change).toLocaleString('en-US'))
            })
        })
    })
    $('#checkout-form').submit(function(e) {
        e.preventDefault()
        start_loader()
        if (change >= 0) {
            $.ajax({
                url: './receipt_format.html',
                error: err => {
                    console.error(err)
                    alert('An error occurred.')
                    end_loader()
                },
                success: function(resp) {
                    var el = $('<div>')
                    el.html(resp)

                    var token = generateToken();
                    console.log("Test : ", $("#printToken").is(":checked"));
                    var includeToken = $("#printToken").is(":checked");
                    if (includeToken) {
                        el.append('<div class="fw-bold text-left ml-3">Token #: ' + token + '</div>');
                        el.append('<div>-----------------------------------------------------</div>');
                        el.append('<div class="fw-bold text-center mt-3 fs-1">Token #: ' + token + '</div>');
                    }
                    
                    el.find('#r-total').text(parseFloat(total).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 }))
                    el.find('#r-tendered').text(parseFloat(parseFloat(total) + parseFloat(change)).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 }))
                    el.find('#r-change').text(parseFloat(change).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 }))
                    Object.keys(listed).map((k) => {
                        el.find('#product-list').append('<div class="col-1 text-center">' + (parseFloat(listed[k].qty).toLocaleString('en-US')) + '</div>')
                        el.find('#product-list').append('<div class="col-8 text-start lh-1">' + (listed[k].product) + '<div><small>x ' + (parseFloat(listed[k].price).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 })) + '</small></div></div>')
                        el.find('#product-list').append('<div class="col-3 text-end">' + (parseFloat(listed[k].qty * listed[k].price).toLocaleString('en-US', { style: 'decimal', maximumFractionDigits: 2, minimumFractionDigits: 2 })) + '</div>')
                    })


                    const report = {
                        date: new Date().toLocaleString(),
                        token: token,
                        items: listed.map(item => ({
                            product: item.product,
                            qty: item.qty,
                            price: item.price,
                            total: (item.qty * item.price).toFixed(2)
                        }))
                    };
            
                    // Store the report in local storage
                    let reports = JSON.parse(localStorage.getItem('reports')) || [];
                    reports.push(report);
                    localStorage.setItem('reports', JSON.stringify(reports));


                    var nw = window.open('', '_blank', 'width=1000,height=900')
                    console.log(el.html())
                    nw.document.write(el.html())
                    nw.document.close()
                    setTimeout(() => {
                        nw.print()
                        setTimeout(() => {
                            nw.close()
                            end_loader()
                            $('.modal').modal('hide')
                            localStorage.setItem('listed', '[]')
                            location.reload()
                        }, 300)
                    }, 500)
                }
            })
        } else {
            alert("Tendered Amount less than payable amount!")
        }
    })

    $('#reports-tab').on('shown.bs.tab', function () {
        loadReports();
    });

    $('#print-report-btn').click(function () {
        printReports();
    });
})
