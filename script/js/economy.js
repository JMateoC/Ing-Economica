function init () {
    const i = document.getElementById('i');
    const j = document.getElementById('j');
    const n = document.getElementById('n');
    const m = document.getElementById('m');
    if ( m && j ) {
        j.disabled = true;
        m.disabled = true;
    }
    const inputs = document.querySelectorAll('input[type="text"]');
    inputs.forEach(input => {
        input.addEventListener('input', event => {
            const input = event.target;
            const value = input.value;

            let filtredValue = value.replace(/[^0-9.]/g, '');

            const fragments = filtredValue.split('.');
            if (fragments.length > 2) {
                filtredValue = fragments[0] + '.' + fragments.slice(1).join('');
            }

            if (value !== filtredValue) {
                input.value = filtredValue;
            }

        });
    });

    if ( document.getElementById('operation') ) {

        document.getElementById('operation').addEventListener('change', event => {
            
            switch (event.target.value) {
                case '0':
                    j.disabled = true;
                    m.disabled = true;
    
                    i.disabled = false;
                    n.disabled = false;
                    break;
                case '1':
                    i.disabled = true;
                    n.disabled = true;
    
                    j.disabled = false;
                    m.disabled = false;
                    break;
            }
        });
    
        document.getElementById('convertTax').addEventListener('click', event => {
            event.preventDefault();
            operation = document.getElementById('operation').value;
            result = convertTax(type=operation , parseFloat(i.value), parseInt(n.value), parseFloat(j.value), parseInt(m.value) );
            switch (operation) {
                case '0':
                    if ( !i.value ) {
                        messageError('Debe Ingresar el interes inicial!');
                        return;
                    }
                    j.value = result.toFixed(4);
                    m.value = n.value;
                    break;
                case '1':
                    if ( !j.value ) {
                        messageError('Debe Ingresar el interes inicial!');
                        return;
                    }
                    i.value = result.toFixed(4);
                    n.value = m.value;
                    break;
            }
        });

    }

    if ( document.getElementById('equality') ) {
        const initialTax = document.getElementById('initialTax');
        const taxType = document.getElementById('taxType');
        const taxTerm = document.getElementById('taxTerm');
        const expectedTaxType = document.getElementById('expectedTaxType');
        const expectedTaxTerm = document.getElementById('expectedTaxTerm');
        document.getElementById('equality').addEventListener('click', event => {
            event.preventDefault();
            if ( !initialTax.value ) {
                messageError('Debe Ingresar la tasa de interes inicial!');
                return;
            }
            let result = parseFloat(initialTax.value);
            if ( isj( taxType.value ) ){
                result = convertTax( '1', 0, 0, parseFloat( initialTax.value ), parseInt( taxTerm.value ) )
            }
            result = calculateEquality( result, parseInt( taxTerm.value ), parseInt( expectedTaxTerm.value ) );
            if ( isj( expectedTaxType.value ) ){
                result = convertTax( '0', result, expectedTaxTerm.value, 0, 0 )
            }
            document.getElementById('equialityTax').textContent = result.toFixed(4) + ' %'

        });

    }

    if ( document.getElementById('calculateTax') ) {
        const p = document.getElementById('p');
        const n = document.getElementById('n');
        const s = document.getElementById('s');
        let i = document.getElementById('i');
        const taxType = document.getElementById('taxType');
        const taxTerm = document.getElementById('taxTerm');
        const paymentTerm = document.getElementById('paymentTerm');
        document.getElementById('calculateTax').addEventListener('click', event => {
            event.preventDefault();

            if ( p.value && n.value && s.value && i.value ){
                messageError('todos los campos están llenos');
            }
            
            if ( p.value && n.value && s.value ) {
                // CALCULAR I
                let tempI = calculateTax(0, parseFloat(p.value), parseInt(n.value), parseFloat(s.value), 0);
                if ( isj( taxType.value ) ) {
                    i.value = convertTax( '0', tempI, parseInt(taxTerm.value), 0, 0 ).toPrecision(2);
                    return;
                }
                i.value = tempI.toPrecision(2);
                return;
            }
            let _i = parseFloat(i.value);
            if ( isj( taxType.value ) ){
                _i = convertTax( '1', 0, 0, _i, parseInt(taxTerm.value) )
            }

            if ( p.value && s.value && String(i) ) {
                // CALCULAR N
                let result = calculateTax(2, parseFloat(p.value), 0, parseFloat(s.value), _i);
                n.value = result;
                return;
            }
            
            if ( paymentTerm.value !== taxTerm.value ) {
                if ( paymentTerm.value > taxTerm.value ) {
                    _i = calculateEquality(_i, parseInt(taxTerm.value), parseInt(paymentTerm.value))
                }else{
                    n.value = parseInt(n.value) * parseInt(taxTerm.value)
                    paymentTerm.value = taxTerm.value;
                }
            }
        
            if ( p.value && n.value && String(_i) ) {
                // CALCULAR S
                s.value = calculateTax(1, parseFloat(p.value), parseInt(n.value), 0, _i);
            } else if ( n.value && s.value && String(_i) ) {
                // CALCULAR P
                p.value = calculateTax(3, 0, parseInt(n.value), parseFloat(s.value), _i);

            }
        })
        
    }

    if ( document.getElementById('calculateAnnual') ) {
        const annualPaymentType = document.getElementById('annualPaymentType');
        const p = document.getElementById('p');
        const n = document.getElementById('n');
        const s = document.getElementById('s');
        const i = document.getElementById('i');
        const taxType = document.getElementById('taxType');
        const taxTerm = document.getElementById('taxTerm');
        const paymentTerm = document.getElementById('paymentTerm');
        const a = document.getElementById('A');
        document.getElementById('calculateAnnual').addEventListener('click', event => {
            event.preventDefault();
            let result = 0;
            let _i = 0
            const taxErrors = document.getElementById('taxErrors');
            i.classList.remove('is-invalid');
            taxErrors.innerHTML = ''
            switch (annualPaymentType.value) {
                case 'Ordinaria':
                    if ( p.value && n.value && s.value && i.value ){
                        messageError('todos los campos están llenos');
                    }
                    
                    if ( p.value && n.value && s.value && a.value ) {
                        // CALCULAR I
                        i.classList.add('is-invalid');
                        taxErrors.innerHTML = '<small class="text-muted">Este campo es Obligatorio</small>'
                        return;
                    }
                    _i = parseFloat(i.value)/100;
                    if ( isj( taxType.value ) ){
                        _i = convertTax( '1', 0, 0, _i*100, parseInt(taxTerm.value) ) / 100
                        i.value = _i * 100;
                        taxType.value = 'Efectivo';
                    }
        
                    if ( String(i) && a.value && (p.value || s.value) && !n.value )   {
                        // CALCULAR N
                        if ( s.value ){
                            result = Math.log10( ((s.value*_i)/a.value) + 1 ) / Math.log10( 1+_i );
                        } else {   
                            result = (-1 * (Math.log10( (-1*(p.value*_i)/a.value) + 1 )/Math.log10( 1 + _i)) );
                        }
                        n.value = Math.round(result);
                        paymentTerm.value = taxTerm.value;
                        return;
                    }
                    
                    if ( paymentTerm.value !== taxTerm.value ) {
                        if ( paymentTerm.value > taxTerm.value ) {
                            _i = calculateEquality(_i*100, parseInt(taxTerm.value), parseInt(paymentTerm.value)) /100
                            i.value = _i * 100;
                            taxTerm.value = paymentTerm.value
                        }else{
                            n.value = parseInt(n.value) * parseInt(taxTerm.value)
                            paymentTerm.value = taxTerm.value;
                        }
                    }
                
                    if ( n.value && String(_i) && a.value ) {
                        // CALCULAR S
                        result = parseFloat(a.value) *( ( Math.pow( 1+ _i, parseInt(n.value) ) -1 ) /_i )
                        s.value = result.toFixed(3);
                    } else if ( n.value && String(_i) && a.value ) {
                        // CALCULAR P
                        result = parseFloat(a.value) *( 1- ( Math.pow( 1 + _i, -1 * parseInt(n.value) ) ) ) / _i 
                        p.value = result.toFixed(3);
        
                    }else if ( n.value && String(_i) && (p.value || s.value)  ) {
                        // CALCULAR A
                        if ( s.value ){
                            result = parseFloat(s.value) / ( ( Math.pow( 1+_i, parseInt(n.value) ) - 1) / _i)
                            a.value = result.toFixed(3)
                        } else {
                            const temp = Math.pow( 1+ _i, -1 * parseInt(n.value) )
                            result = parseFloat(p.value) / ( ( 1 - temp ) / _i)
                            a.value = result.toFixed(3)
                        }
                    }
                    break;
                case 'Anticipada':
                    if ( p.value && n.value && s.value && i.value ){
                        messageError('todos los campos están llenos');
                    }
                    
                    if ( !i.value ) {
                        // CALCULAR I
                        i.classList.add('is-invalid');
                        taxErrors.innerHTML = '<small class="text-muted">Este campo es Obligatorio</small>'
                        return;
                    }
                    _i = parseFloat(i.value)/100;
                    if ( isj( taxType.value ) ){
                        _i = convertTax( '1', 0, 0, _i*100, parseInt(taxTerm.value) ) / 100
                    }
        
                    if ( _i && a.value && (p.value || s.value) && !n.value )   {
                        // CALCULAR N
                        if ( s.value ){
                            result = (-1 * (Math.log10(  ((parseFloat(s.value)*_i) + a + (parseFloat(a.value)*_i))/(parseFloat(a.value)*(1+_i)) )/Math.log( 1 + _i)) );

                        } else {   
                            result = (-1 * (Math.log10( -1*( ((parseFloat(p.value)*_i) - a - (parseFloat(a.value)*_i))/(parseFloat(a.value)*(1+_i)) ))/Math.log10( 1 + _i)) );
                        }
                        n.value = Math.round(result);
                        paymentTerm.value = taxTerm.value;
                        return;
                    }
                    
                    if ( paymentTerm.value !== taxTerm.value ) {
                        if ( paymentTerm.value > taxTerm.value ) {
                            _i = calculateEquality(_i*100, parseInt(taxTerm.value), parseInt(paymentTerm.value))
                        }else{
                            n.value = parseInt(n.value) * parseInt(taxTerm.value)
                            paymentTerm.value = taxTerm.value;
                        }
                    }
                
                    if ( n.value && _i && a.value ) {
                        // CALCULAR S
                        result = parseFloat(a.value) *( ( Math.pow( 1+ _i, parseInt(n.value) ) -1 ) /_i ) * ( 1 + _i )
                        s.value = result.toFixed(3);
                    } 
                    if ( n.value && String(_i) && a.value ) {
                        // CALCULAR P
                        result = parseFloat(a.value) *( 1- ( Math.pow( 1 + _i, -1 * parseInt(n.value) ) ) ) / _i * ( 1 + _i )
                        p.value = result.toFixed(3);
        
                    }
                    if ( n.value && String(_i) && (p.value || s.value)  ) {
                        // CALCULAR A
                        if ( s.value ){
                            result = parseFloat(s.value) / (( ( Math.pow( 1+_i, parseInt(n.value) ) - 1) / _i) *( 1 + _i ))
                            a.value = result.toFixed(3)
                        } else {
                            result = parseFloat(p.value) / (( ( 1 - Math.pow( 1+ _i, -1 * parseInt(n.value) )) / _i) * ( 1 + _i ))
                            a.value = result.toFixed(3)
                        }
                    }
                    break;
            }

            
        });

        document.getElementById('generateAmortizationTable').addEventListener('click', event => {
            event.preventDefault();

            if ( !p.value ){
                messageError('La amortización requiere Valor presente');
                return false;
            }

            saveInLocal(annualPaymentType, p, n, s, i, a, 'amortization');
            
        });

        document.getElementById('generateCapitalizationTable').addEventListener('click', event => {
            event.preventDefault();

            if ( !s.value ){
                messageError('La capitalización requiere valor futuro');
                return false;
            }

            saveInLocal(annualPaymentType, p, n, s, i, a, 'capitalization');
            
        });

    }

    if ( document.getElementById('amortize') ) {
        localStorage.clear();
        const urlParams = new URLSearchParams(window.location.search);
        const data = urlParams.get('data');
        let annuality = JSON.parse(decodeURIComponent(data));
        if ( annuality ) {
            localStorage.setItem('annuality', JSON.stringify(annuality) );
            initTable('amortization-body', 0);
        }

        document.getElementById('amortize').addEventListener('click', event => {
            event.preventDefault();

            const amortization = parseFloat(document.getElementById('amortization').value)
            const amortizationTerm = parseInt(document.getElementById('amortizationTerm').value)
            if ( !amortization || !amortizationTerm ) {
                messageError('El abono debe tener un valor y un periodo');
                return;
            }
            addTableChange(amortization, amortizationTerm);
            initTable('amortization-body', 0);

        });
    }

    if ( document.getElementById('capitalize') ) {
        localStorage.clear();
        const urlParams = new URLSearchParams(window.location.search);
        const data = urlParams.get('data');
        const annuality = JSON.parse(decodeURIComponent(data));
        if ( annuality ) {
            localStorage.setItem('annuality', JSON.stringify(annuality) );
            initTable('capitalization-body', 1);
        }

        document.getElementById('capitalize').addEventListener('click', event => {
            event.preventDefault();

            const capitalization = parseFloat(document.getElementById('capitalization').value)
            const capitalizationTerm = parseInt(document.getElementById('capitalizationTerm').value)
            if ( !capitalization || !capitalizationTerm ) {
                messageError('La capitalización debe tener un valor y un periodo');
                return;
            }
            addTableChange(capitalization, capitalizationTerm);
            initTable('capitalization-body', 1);

        });
    }

}

function addTableChange( value, term ){
    console.log(value)
    console.log(term)
    let tableChanges = JSON.parse(localStorage.getItem('tableChanges'));
    if ( tableChanges ) {
        console.log(typeof(tableChanges));
        tableChanges.push({ value: value, term: term });
        localStorage.setItem('tableChanges', JSON.stringify(tableChanges) );

    }else {
        let changes = [
            { value: value, term: term },
        ]
        localStorage.setItem('tableChanges', JSON.stringify(changes) );
    }
};

function initTable(body, type){
    const annuality = JSON.parse(localStorage.getItem('annuality'));
    const tableBody = document.getElementById(`${body}`)
    if ( annuality ) {
        let tableChanges = JSON.parse(localStorage.getItem('tableChanges'));

        let remainder = annuality.p;
        let goal = annuality.s;
        let cuote = annuality.a;
        let tax = annuality.i/100;
        let taxValue = 0;
        switch (type) {
            case 0:
                let amortization = 0;
                let installment = 0;
                tableBody.innerHTML = '';

                let row = document.createElement('tr');

                let cellTerm = document. createElement('td');
                cellTerm.textContent = '0'
                row.appendChild(cellTerm);

                let cellRemainder = document. createElement('td');
                cellRemainder.textContent = remainder;
                row.appendChild(cellRemainder);

                tableBody.appendChild(row);

                installment = tableChanges ? tableChanges.find(change => {
                    return change.term === 1;
                }) : 0

                taxValue = remainder*tax;
                amortization = cuote - taxValue;
                remainder = remainder- amortization;
                cuote = installment ? annuality.a + installment.value : annuality.a
                
                for (let x=1; x< (annuality.n+1); x++){

                    row = document.createElement('tr');

                    cellTerm = document. createElement('td');
                    cellTerm.textContent = x
                    row.appendChild(cellTerm);

                    cellRemainder = document. createElement('td');
                    cellRemainder.textContent = remainder.toFixed(3);
                    row.appendChild(cellRemainder);

                    let cellTax = document. createElement('td');
                    cellTax.textContent = taxValue.toFixed(3);
                    row.appendChild(cellTax);

                    let cellCuote = document. createElement('td');
                    cellCuote.textContent = cuote;
                    row.appendChild(cellCuote);

                    let cellAmortization = document. createElement('td');
                    cellAmortization.textContent = amortization.toFixed(3);
                    row.appendChild(cellAmortization);

                    tableBody.appendChild(row);

                    installment = tableChanges ? tableChanges.find(change => {
                        return change.term === x+1;
                    }) : 0

                    if (remainder <= 0 ) {
                        return;
                    }

                    taxValue = remainder*tax;
                    amortization = remainder - (cuote - taxValue) < 0 ? remainder : cuote - taxValue
                    remainder = remainder - amortization
                    cuote = installment ? annuality.a + installment.value : annuality.a
                    

                }
                break;
            case 1:
                let increment = 0;
                let capitalización = 0;
                tableBody.innerHTML = '';

                let row2 = document.createElement('tr');

                let cellTerm2 = document. createElement('td');
                cellTerm2.textContent = '1'
                row2.appendChild(cellTerm2);

                let cellRemainder2 = document. createElement('td');
                cellRemainder2.textContent = cuote;
                row2.appendChild(cellRemainder2);

                let cellTax = document. createElement('td');
                    cellTax.textContent = '';
                    row2.appendChild(cellTax);

                capitalización = tableChanges ? tableChanges.find(change => {
                    return change.term === 1;
                }) : 0
                cuote = capitalización ? annuality.a + capitalización : annuality.a;
                
                let cellCuote = document. createElement('td');
                cellCuote.textContent = cuote;
                row2.appendChild(cellCuote);

                let cellAmortization = document. createElement('td');
                cellAmortization.textContent = cuote.toFixed(3);
                row2.appendChild(cellAmortization);

                remainder = cuote;


                tableBody.appendChild(row2);

                taxValue = remainder*tax;
                increment = cuote + taxValue;
                remainder = remainder + increment;
                capitalización = tableChanges ? tableChanges.find(change => {
                    return change.term === 2;
                }) : 0
                cuote = capitalización ? annuality.a + capitalización : annuality.a;
                
                for (let x=2; x< (annuality.n+1); x++){
                    row2 = document.createElement('tr');

                    cellTerm2 = document. createElement('td');
                    cellTerm2.textContent = x
                    row2.appendChild(cellTerm2);

                    cellRemainder2 = document. createElement('td');
                    cellRemainder2.textContent = remainder.toFixed(3);
                    row2.appendChild(cellRemainder2);

                    let cellTax = document. createElement('td');
                    cellTax.textContent = taxValue.toFixed(3);
                    row2.appendChild(cellTax);

                    let cellCuote = document. createElement('td');
                    cellCuote.textContent = cuote;
                    row2.appendChild(cellCuote);

                    let cellIncrement = document. createElement('td');
                    cellIncrement.textContent = increment.toFixed(3);
                    row2.appendChild(cellIncrement);

                    tableBody.appendChild(row2);

                    if (remainder >= goal ) {
                        return;
                    }

                    taxValue = remainder*tax;
                    cuote = (remainder + (cuote + taxValue) )> goal ? goal - (remainder + taxValue): annuality.a;
                    increment = cuote + taxValue;
                    remainder = remainder + increment;
                    capitalización = tableChanges ? tableChanges.find(change => {
                        return change.term === x+1;
                    }) : 0
                    cuote = capitalización ? annuality.a + capitalización : annuality.a;

                }
                break;

        }
    }
}

function saveInLocal(annualPaymentType, p , n, s, i, a, template) {
    if ( !annualPaymentType.value || !n.value || (!p.value && !s.value) || !i.value || !a.value ) {
        messageError('Debe llenar todos los campos');
        return false;
    }
    const taxTerm = document.getElementById('taxTerm');
    const paymentTerm = document.getElementById('paymentTerm');
    const taxType = document.getElementById('taxType');

    i = parseFloat(i.value);
    n = parseInt(n.value);

    if (isj(taxType.value)){
        i = convertTax('1', 0, 0, i, parseInt(taxTerm.value));
    }

    if ( paymentTerm.value !== taxTerm.value ) {
        if ( paymentTerm.value > taxTerm.value ) {
            i = calculateEquality( i, parseInt(taxTerm.value), parseInt(paymentTerm.value) )
        }else{
            n = n * parseInt(taxTerm.value)
            paymentTerm.value = taxTerm.value;
        }
    }
    const annuality = JSON.stringify({
        annualPaymentType: annualPaymentType.value,
        n: n,
        i: i,
        a: parseFloat(a.value),
        p: parseFloat(p.value),
        s: parseFloat(s.value)
    });
    const encodedData = encodeURIComponent(annuality);
    window.location.href = `${template}.html?data=${encodedData}`;
}

function isj( taxType ) {
    return taxType=='Nominal' || taxType=='Vencido' || taxType=='Capitalizable' || taxType=='Convertible' ? true : false
}

function convertTax ( type, i, n, j, m ) {
    switch (type) {
        case '0':
            return i * n;
        case '1':
            return j/m;
    }
}

function calculateEquality ( i, n, m ) {
    i = i/100;
    return (Math.pow(Math.pow((1+i),n), 1/m) - 1) * 100
}

function calculateTax ( type, p, n, s, i ) {
    let result = 0
    switch ( type ) {
        case 0:
            // CALCULAR i
            i = Math.pow( s/p , 1/n) - 1;
            return i*100;
        case 1:
            // Calcular S
            i = i/100;
            s = p*Math.pow( ( 1+i ) , n );
            return s.toFixed(3);
        case 2:
            // Calcular n
            i = i/100;
            n = Math.log10(s/p)/Math.log10(1+i);
            return Math.round(n);
        case 3:
            //CALCULAR P
            i = i/100;
            result = s/Math.pow(1+i, n);
    }
    return result.toFixed(3)
}

function messageError(message){
    Toastify({
        text: message,
        duration: 3000, 
        close: true,
        gravity: "top",
        position: "right", 
        backgroundColor: "#FF0000", 
        stopOnFocus: true,
    }).showToast();
}

document.addEventListener('DOMContentLoaded', () => {
    init();
});