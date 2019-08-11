const supportedCards = {
    visa, mastercard
  };

  const countries = [
    {
      code: "US",
      currency: "USD",
      currencyName: '',
      country: 'United States'
    },
    {
      code: "NG",
      currency: "NGN",
      currencyName: '',
      country: 'Nigeria'
    },
    {
      code: 'KE',
      currency: 'KES',
      currencyName: '',
      country: 'Kenya'
    },
    {
      code: 'UG',
      currency: 'UGX',
      currencyName: '',
      country: 'Uganda'
    },
    {
      code: 'RW',
      currency: 'RWF',
      currencyName: '',
      country: 'Rwanda'
    },
    {
      code: 'TZ',
      currency: 'TZS',
      currencyName: '',
      country: 'Tanzania'
    },
    {
      code: 'ZA',
      currency: 'ZAR',
      currencyName: '',
      country: 'South Africa'
    },
    {
      code: 'CM',
      currency: 'XAF',
      currencyName: '',
      country: 'Cameroon'
    },
    {
      code: 'GH',
      currency: 'GHS',
      currencyName: '',
      country: 'Ghana'
    }
  ];

  const billHype = () => {
    const billDisplay = document.querySelector('.mdc-typography--headline4');
    if (!billDisplay) return;

    billDisplay.addEventListener('click', () => {
      const billSpan = document.querySelector("[data-bill]");
      if (billSpan &&
        appState.bill &&
        appState.billFormatted &&
        appState.billFormatted === billSpan.textContent) {
        window.speechSynthesis.speak(
          new SpeechSynthesisUtterance(appState.billFormatted)
        );
      }
    });
  };

  const appState = {};

  const formatAsMoney = (amount, buyerCountry) =>{
      let userCountry = countries.find(name => name.country ===buyerCountry);
      if(userCountry.length === null){
          userCountry = "United States";
      }
    
    return amount.toLocaleString('en-' + userCountry.code, {style: "currency", currency:userCountry.currency});
  };

  const flagIfInvalid = (field, isValid) => {
      if(isValid === true){
          field.classList.remove('is-invalid');
      }else{
          field.classList.add("is-invalid");
      };
  };

  const expiryDateFormatIsValid = (field) => {
      const regex = /^((0[1-9])|0[1-2])\/([0-9][0-9])$/;
      if(regex.test(field)){
          return true;
      }else{
          return false;
      }
  }

  const detectCardType = (first4Digits) => {
      const cardDiv = document.querySelector('[data-credit-card]');
      const cardType = document.querySelector('[data-card-type]');
      if(first4Digits[0]===4){
          cardDiv.classList.remove('is-mastercard');
          cardDiv.classList.add('is-visa');
          cardType.src = supportedCards.visa;
          return 'is-visa'
      }else{
          cardDiv.classList.remove('is-visa');
          cardType.src='https://placehold.it/120x60.png?text=Card';
      }
      if(first4Digits[0]===5){
          cardDiv.classList.remove('is-visa');
          cardDiv.classList.add('is-mastercard')
          cardType.src = supportedCards.mastercard;
          return 'is-mastercard'
      }else{
          cardDiv.classList.remove('is-mastercard');
          cardType.src = 'https://placehold.it/120x60.png?text=Card';
      }

  }

  const validateCardExpiryDate = () => {
      const dateFormat = document.querySelector("[data-cc-info] input:nth-child(2)")
      const dateValue = document.querySelector("[data-cc-info] input:nth-child(2)").value
      const currentDate = new Date();
      const currentYear = currentDate.getFullYear();
      const currentMonth = currentDate.getMonth + 1;
      const dateCard = dateFormat.value.split("/");
      const year = parseInt(dateCard[1], 10) + 2000;
      const month = parseInt(dateCard[0]);
      if(!expiryDateFormatIsValid(dateValue) && year<currentYear || (year<currentYear && month<currentMonth)){
          flagIfInvalid(dateFormat, false)
          return false;
      }else{
          flagIfInvalid(dateFormat, true)
          return true;
      }

  }

  const validateCardHolderName = () => {
      const regex = /^[a-zA-Z]{3,}(\s[a-zA-Z]{3,})$/;
      const holderName = document.querySelector("[data-cc-info] input:first-child").value;
      const nameField = document.querySelector("[data-cc-info] input:first-child");
      const valid = regex.test(holderName);
      flagIfInvalid(nameField, valid)
      return valid;
  }

  const validateWithLuhn = (digits) => {
      const arrayCopy = [...digits]
    for(let i = arrayCopy.length; i >=0; i -=2){
        if(arrayCopy[i] !== undefined){
            const doubled = arrayCopy[i] *2

            if(doubled > 9){
                const newDoubled = doubled - 9
                arrayCopy[i] = newDoubled
            }else{
                arrayCopy[i] = doubled
            }
        }
    }
    const sum = arrayCopy.reduce((acc, digit)=>(acc += digit), 0)
    const remainder = sum % 10
    if(remainder === 0){
        return true
    }
    return false
  };

  const validateCardNumber = () => {
    const first = document.querySelector('[data-cc-digits] input:nth-child(1)').value;
    const second = document.querySelector('[data-cc-digits] input:nth-child(2)').value;
    const third = document.querySelector('[data-cc-digits] input:nth-child(3)').value;
    const fourth = document.querySelector('[data-cc-digits] input:nth-child(4)').value;

      const inputDiv = document.querySelector('[data-cc-digits]');
      const inputArr = [first + second + third + fourth];
      console.log(`this is card numbers ${inputArr}`);
      const newArr = [];
      let i;
      for(i of inputArr.toString()){
          newArr.push(parseInt(i))
      }
      const isCard = validateWithLuhn(newArr)
      if(isCard){
          inputDiv.classList.remove('is-invalid')
          return true;
      }else{
          inputDiv.classList.add('is-invalid');
          return false;
      }
  }

  const validatePayment = () => {
      validateCardNumber();
      validateCardHolderName();
      validateCardExpiryDate();

  }
  const smartInput = (event, fieldIndex, fields) => {
      const controlKeys = [
          'Tab', 
          'Delete',
          'Backspace',
          'ArrowRight',
          "ArrowLeft",
          'Shift',
          'ArrowUp',
          'ArrowDown'
      ];

      const isControlKey = controlKeys.includes(event.key);
      if(!isControlKey){
          if(fieldIndex <= 3){
              if(/^\d$/.test(event.key)){
                  if(appState.cardDigits[fieldIndex] === undefined){
                      appState.cardDigits[fieldIndex] =[]; 
                  }
                  const field = fields[fieldIndex];
                  event.preventDefault();
                  const target = event.target;
                  let{selectionStart, value} = target;
                  appState.cardDigits[fieldIndex][selectionStart] = +event.key;
                  target.value = value.substr(0, selectionStart) + event.key + value.substr(selectionStart + 1);
                  setTimeout(()=>{
                      console.log(appState.cardDigits)
                      appState.cardDigits[fieldIndex] = target.value.split('')
                      .map((curr, i)=>(curr >='0' && curr<='9') ? Number(curr):Number(appState.cardDigits[fieldIndex][i]));
                      if(fieldIndex < 3){
                          target.value=target.value.replace(/\d/g, '$');
                      }
                      smartCursor(event, fieldIndex, fields);
                      if(fieldIndex==0 && target.value.length>=4){
                          let first4Digits = appState.cardDigits[0];
                          console.log(first4Digits);
                          console.log(typeof first4Digits);
                          detectCardType(first4Digits)
                      }
                  }, 500);
              }else{
                  event.preventDefault();
              }
          }else if(fieldIndex===4){
              if(/[a-z]|\s/i.test(event.key)){
                  setTimeout(()=>{
                      smartCursor(event, fieldIndex, fields);
                  }, 500);
              }else{
                  event.preventDefault();
              }
          }else{
              if(/\d|\//.test(event.key)){
                  setTimeout(()=>{
                      smartCursor(event, fieldIndex, fields);
                  }, 500)
              }else{
                  event.preventDefault();
              }
          }
      }else{
          if(event.key ==='Backspace'){
              if(appState.cardDigits[fieldIndex].length>0){
                  appState.cardDigits[fieldIndex].splice(-1, 1);
              }
              smartBackspace(event, fieldIndex, fields);
          }else if(event.key == 'Delete'){
              if(appState.cardDigits[fieldIndex].length > 0){
                  appState.cardDigits[fieldIndex].splice(1,1)
              }
          }
      }
  };

  const smartBackspace = (event, fieldIndex, fields)=>{
      if(fieldIndex < fields.length -1){
          if(fields[fieldIndex].value.length === Number(fields[fieldIndex].size)){
              fields[fieldIndex +1].focus();
          }
      }
  };

  const smartCursor = (event, fieldIndex, fields) => {
      if(fieldIndex < fields.length -1){
          if(fields[fieldIndex].value.length === Number(fields[fieldIndex].size)){
              fields[fieldIndex +1].focus();
          }
      }
  };

  const enableSmartTyping = () =>{
      const [...inputFields] = document.querySelectorAll("[data-credit-card] input");
      inputFields.forEach((field, index, fields) =>{
          field.addEventListener('keydown', (event) =>{
              smartInput(event, index, fields);
          });
      });
  };

  const uiCanInteract = () => {
      document.querySelector("[data-cc-digits] input:nth-child(1)").focus();
      document.querySelector("[data-pay-btn]").addEventListener('click', validatePayment);
      billHype();
      enableSmartTyping();
  }

  const displayCartTotal = ({results}) => {
      let [data] = results;
      let{itemsInCart, buyerCountry} = data;
      appState.items = itemsInCart;
      appState.country = buyerCountry;
      appState.bill = itemsInCart.reduce((acc, item) =>{
          return acc + (item.price * item.qty)
      }, 0)
      appState.billFormatted = formatAsMoney(appState.bill, appState.country)
      document.querySelector("[data-bill]").textContent = appState.billFormatted;

      appState.cardDigits = [];
      uiCanInteract();
      
  }


  const fetchBill = () => {
    const apiHost = 'https://randomapi.com/api';
    const apiKey = '006b08a801d82d0c9824dcfdfdfa3b3c';
    const apiEndpoint = `${apiHost}/${apiKey}`;
    fetch(apiEndpoint)
    .then((response) => response.json())
    .then(data => displayCartTotal(data))
    .catch(error => console.log(error));	
  };

    

    
  
  const startApp = () => {
      fetchBill();
  };

  startApp();