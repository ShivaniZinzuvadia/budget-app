//Budget Controller
var budgetController = (function () {
    var Expense = function (id, description, value) {
        this.id = id,
            this.description = description,
            this.value = value
        this.percentage = -1;
    }

    Expense.prototype.calPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        }
        else {
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var Income = function (id, description, value) {
        this.id = id,
            this.description = description,
            this.value = value
    }

    var calculateTotal = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (current) {
            sum = sum + current.value;
        })
        data.totals[type] = sum;
    }

    var data = {
        allItems: {
            exp: [],
            inc: []
        },
        totals: {
            exp: 0,
            inc: 0
        },
        budget: 0,
        percentage: -1
    }

    return {
        addItem: function (type, desc, val) {
            var newItem, ID;
            // Create new ID
            if (data.allItems[type].length > 0) {
                ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }
            else {
                ID = 0;
            }

            // Create new Item based on 'inc' and 'exp' type
            if (type === 'exp') {
                newItem = new Expense(ID, desc, val);
            } else if (type === 'inc') {
                newItem = new Income(ID, desc, val);
            }

            // push new item in data structure
            data.allItems[type].push(newItem);

            // Return new element
            return newItem;
        },
        getItems: function () {
            console.log(data);
        },
        removeItem: function (type, ID) {
            var ids, index;
            ids = data.allItems[type].map(function (current) {
                return current.id;
            });

            index = ids.indexOf(ID);

            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },
        calculateBudget: function () {
            // Calculate totla expense and income
            calculateTotal('exp');
            calculateTotal('inc');

            // Calculate the budget : income - expense
            data.budget = data.totals.inc - data.totals.exp;

            // Calculate percentage
            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            }
            else {
                data.percentage = -1;
            }

        },
        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calPercentage(data.totals.inc);
            });
        },
        getPercentages: function () {
            var allPerc = data.allItems.exp.map(function (cur) {
                return cur.getPercentage();
            });
            return allPerc;
        },
        getBudget: function () {
            return {
                budget: data.budget,
                totalInc: data.totals.inc,
                totalExp: data.totals.exp,
                percentage: data.percentage
            };
        },
        testing: function () {
            console.log(data);
        }
    }
})();

//UI Controller
var uiController = (function () {
    var DOMInput = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expensePerLabel: '.item__percentage',
        monthLabel: '.budget__title--month'
    }

    var formatNumber = function(num, type){
        var numSplit, int, dec;
        num = Math.abs(num);
        num = num.toFixed(2);
        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }
        dec = numSplit[1];
        
        return (type === 'exp' ? '-' : '+') + ' ' + int + '.' + dec;
    }

    var nodeListForEach = function(list, callback){
        for(var i = 0; i < list.length; i++){
            callback(list[i], i);
        }
    }

    return {
        getInput: function () {
            return {
                type: document.querySelector(DOMInput.inputType).value,
                description: document.querySelector(DOMInput.inputDescription).value,
                value: parseFloat(document.querySelector(DOMInput.inputValue).value)
            };
        },
        addNewItem: function (type, object) {
            var html, newHtml, element;

            if (type === 'exp') {
                element = DOMInput.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%">' +
                    '<div class="item__description">%description%</div>' +
                    '<div class="right clearfix">' +
                    '<div class="item__value">%value%</div>' +
                    '<div class="item__percentage">21%</div>' +
                    '<div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            } else if (type === 'inc') {
                element = DOMInput.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%">' +
                    '<div class="item__description">%description%</div>' +
                    '<div class="right clearfix">' +
                    '<div class="item__value">%value%</div>' +
                    '<div class="item__delete">' +
                    '<button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button>' +
                    '</div>' +
                    '</div>' +
                    '</div>';
            }
            // Replace placeholder text with actual value
            newHtml = html.replace('%id%', object.id);
            newHtml = newHtml.replace('%description%', object.description);
            newHtml = newHtml.replace('%value%', formatNumber(object.value, type));

            // Insert HTML into DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);

        },
        removeListItem: function (elementID) {
            var el = document.getElementById(elementID);
            el.parentNode.removeChild(el);
        },
        clearInput: function () {
            var fields, fieldsArr;
            fields = document.querySelectorAll(DOMInput.inputDescription + ',' + DOMInput.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);
            fieldsArr.forEach(function (current, index, array) {
                current.value = "";
            });
            fieldsArr[0].focus();
        },
        displayBudget: function (obj) {
            var type;
            obj.budget > 0 ? type = "inc" : type = "exp";
            document.querySelector(DOMInput.budgetLabel).textContent = formatNumber(obj.budget, type);
            document.querySelector(DOMInput.incomeLabel).textContent =formatNumber(obj.totalInc, 'inc');
            document.querySelector(DOMInput.expenseLabel).textContent = formatNumber(obj.totalExp, 'exp');

            if (obj.percentage > 0) {
                document.querySelector(DOMInput.percentageLabel).textContent = obj.percentage + '%';
            } else {
                document.querySelector(DOMInput.percentageLabel).textContent = '---';
            }
        },
        displayPercentage: function(percentages){
            var fields = document.querySelectorAll(DOMInput.expensePerLabel);
            nodeListForEach(fields, function(current, index){
                if(percentages[index] > 0){
                    current.textContent = percentages[index] + ' %';
                }else{
                    current.textContent = '---';
                }
            });
        },
        displayMonth: function(){
            var now, month, year, months;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
            month = now.getMonth();
            year = now.getFullYear();
            document.querySelector(DOMInput.monthLabel).textContent = months[month] + ' ' + year;
        },  
        changedType: function(){
            var fields = document.querySelectorAll(
                DOMInput.inputType + ',' + DOMInput.inputDescription + ',' + DOMInput.inputValue
            );
            
            nodeListForEach(fields, function(current){
                current.classList.toggle('red-focus');
            });

            document.querySelector(DOMInput.inputBtn).classList.toggle('red');
            
        },
        getDomInput: function () {
            return DOMInput;
        }
    }
})();

//Global App Controller
var controller = (function (budgetCtrl, uiCtrl) {
    var setEventListeners = function () {
        var DOM = uiCtrl.getDomInput();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(DOM.container).addEventListener('click', ctrlRemoveItem);

        document.querySelector(DOM.inputType).addEventListener('change',uiCtrl.changedType);
    };
    var updatePercentages = function () {
        // 1 Calculate percentages
        budgetCtrl.calculatePercentages();

        // 2. Read percentage from budget controller
        var percentages = budgetCtrl.getPercentages();

        // 3. Update UI with new percentage
        uiCtrl.displayPercentage(percentages);
    }

    var updateBudget = function () {
        // Calculate budget
        budgetCtrl.calculateBudget();

        // Return budget
        var budget = budgetCtrl.getBudget();

        //Display budget
        uiCtrl.displayBudget(budget);

    }
    var ctrlAddItem = function () {
        var input, newItem;
        // 1) Get the field input data
        input = uiCtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value !== 0) {
            // 2) Add item to budget controller
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            budgetCtrl.getItems();

            // 3) Add the item to UI
            uiController.addNewItem(input.type, newItem);
            uiController.clearInput();

            //Update Budget
            updateBudget();

            // Update Percentage
            updatePercentages();
        }
    }
    var ctrlRemoveItem = function (event) {
        var itemID, splitID, type, ID;
        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        splitID = itemID.split('-');
        type = splitID[0];
        ID = parseInt(splitID[1]);

        // Update budget data strcture
        budgetCtrl.removeItem(type, ID);

        // Remove item from the list
        uiController.removeListItem(itemID);

        // Update budget
        updateBudget();

        // Update Percentage
        updatePercentages();
    };
    return {
        init: function () {
            uiCtrl.displayMonth();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            setEventListeners();
        }
    }
})(budgetController, uiController);

controller.init();