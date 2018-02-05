var budgetController = (function () {
    var expense = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    expense.prototype.calcPercentage = function (totalIncome) {
        if (totalIncome > 0) {
            this.percentage = Math.round((this.value / totalIncome) * 100);
        } else {
            this.percentage = -1;
        }
    };

    expense.prototype.getPercentage = function () {
        return this.percentage;
    };

    var income = function (id, description, value) {
        this.id = id;
        this.description = description;
        this.value = value;
    };

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
    };
    var calBudget = function (type) {
        var sum = 0;
        data.allItems[type].forEach(function (cur) {
            sum += cur.value;
        });
        data.totals[type] = sum;
    };

    return {
        addItem: function (type, desc, val) {
            var newItem, id;

            if (data.allItems[type].length === 0) {
                id = 0;
            } else {
                id = data.allItems[type][data.allItems[type].length - 1].id + 1;
            }

            if (type === 'inc') {
                newItem = new income(id, desc, val);
            } else if (type === 'exp') {
                newItem = new expense(id, desc, val);
            }

            data.allItems[type].push(newItem);
            return newItem;
        },

        deleteItem: function (type, id) {
            var ids, index;

            ids = data.allItems[type].map(function (cur) {
                return cur.id;
            });

            index = ids.indexOf(id);
            if (index !== -1) {
                data.allItems[type].splice(index, 1);
            }
        },

        calculateBudget: function () {
            calBudget('inc');
            calBudget('exp');

            data.budget = data.totals.inc - data.totals.exp;

            if (data.totals.inc > 0) {
                data.percentage = Math.round((data.totals.exp / data.totals.inc) * 100);
            } else {
                data.percentage = -1;
            }
        },

        calculatePercentages: function () {
            data.allItems.exp.forEach(function (cur) {
                cur.calcPercentage(data.totals.inc);
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
            }
        },
        test: function () {
            console.log(data);
        }
    }
})();

var uiController = (function () {

    var domStrings = {
        inputType: '.add__type',
        inputDesc: '.add__description',
        inputValue: '.add__value',
        addBtn: '.add__btn',
        incomeContainer: '.income__list',
        expenseContainer: '.expenses__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container',
        expPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNo = function (no, type) {
        var split, firstPart, secondPart;
        no = Math.abs(no);
        no = no.toFixed(2);
        split = no.split('.');

        if (split[0].length > 3) {
            firstPart = split[0].substr(0, split[0].length - 3) + ',' + split[0].substr(split[0].length - 3, 3);
        } else
            firstPart = split[0];

        secondPart = split[1];

        return (type === 'inc' ? '+ ' : '- ') + firstPart + '.' + secondPart;
    };
    return {
        getInput: function () {
            return {
                type: document.querySelector(domStrings.inputType).value,
                description: document.querySelector(domStrings.inputDesc).value,
                value: parseFloat(document.querySelector(domStrings.inputValue).value)
            };
        },
        getDomStrings: function () {
            return domStrings;
        },
        addListItem: function (item, type) {
            var html, newHtml, element;

            if (type === 'inc') {
                element = domStrings.incomeContainer;
                html = '<div class="item clearfix" id="inc-%id%"> <div class="item__description">%desc%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div>' +
                    '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button> </div> </div> </div>';
            } else if (type === 'exp') {
                element = domStrings.expenseContainer;
                html = '<div class="item clearfix" id="exp-%id%"><div class="item__description">%desc%</div>' +
                    '<div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div>' +
                    '<div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }

            newHtml = html.replace('%id%', item.id);
            newHtml = newHtml.replace('%desc%', item.description);
            newHtml = newHtml.replace('%value%', formatNo(item.value, type));

            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
        },

        deleteListItem: function (elementId) {
            var el = document.getElementById(elementId);
            el.parentNode.removeChild(el);
        },

        displayBudget: function (budget) {
            document.querySelector(domStrings.budgetLabel).textContent = budget.budget >= 0 ? formatNo(budget.budget, 'inc') : formatNo(budget.budget, 'exp');
            document.querySelector(domStrings.incomeLabel).textContent = formatNo(budget.totalInc, 'inc');
            document.querySelector(domStrings.expenseLabel).textContent = formatNo(budget.totalExp, 'exp');

            if (budget.percentage > 0) {
                document.querySelector(domStrings.percentageLabel).textContent = budget.percentage + '%';
            } else {
                document.querySelector(domStrings.percentageLabel).textContent = '---';
            }
        },

        displayPercentages: function (percentages) {
            var fields, nodeListForEach;

            fields = document.querySelectorAll(domStrings.expPercentageLabel);

            nodeListForEach = function (list, callback) {
                for (var i = 0; i < list.length; i++) {
                    callback(list[i], i, percentages);
                }
            };

            nodeListForEach(fields, function (cur, index, percentages) {
                if (percentages[index] > 0) {
                    cur.textContent = percentages[index] + '%';
                } else {
                    cur.textContent = '---';
                }
            });
        },

        displayDate: function () {
            var now, year, month;
            now = new Date();
            year = now.getFullYear();
            month = now.toTimeString();
            document.querySelector(domStrings.dateLabel).textContent = month;

        },

        clearFields: function () {
            var fields, fieldsArr;

            fields = document.querySelectorAll(domStrings.inputDesc + ', ' + domStrings.inputValue);
            fieldsArr = Array.prototype.slice.call(fields);

            fieldsArr.forEach(function (cur, i, arr) {
                cur.value = "";
            });
            fieldsArr[0].focus();
        }
    };
})();

var controller = (function (budgetCtrl, uiCtrl) {

    var setupEventListeners = function () {
        var dom = uiCtrl.getDomStrings();
        document.querySelector(dom.addBtn).addEventListener('click', ctrlAddItem);
        document.addEventListener('keypress', function (event) {
            if (event.keyCode === 13 || event.which === 13) {
                ctrlAddItem();
            }
        });
        document.querySelector(dom.container).addEventListener('click', ctrlDeleteItem);
    };

    var updateBudget = function () {
        //cal the budget
        budgetCtrl.calculateBudget();
        // return the budget
        var budget = budgetCtrl.getBudget();
        //display the budget
        uiCtrl.displayBudget(budget);
    };

    var updatePercentages = function () {
        budgetCtrl.calculatePercentages();
        var percentages = budgetCtrl.getPercentages();
        uiCtrl.displayPercentages(percentages);
    };

    var ctrlAddItem = function () {
        var input, newItem;

        input = uiCtrl.getInput();

        if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
            newItem = budgetCtrl.addItem(input.type, input.description, input.value);
            uiCtrl.addListItem(newItem, input.type);
            uiCtrl.clearFields();
            updateBudget();
            updatePercentages();
        }
    };

    var ctrlDeleteItem = function (event) {
        var itemId, splitId, type, id;

        itemId = event.target.parentNode.parentNode.parentNode.id;
        if (itemId) {
            splitId = itemId.split('-');
            type = splitId[0];
            id = parseInt(splitId[1]);

            budgetCtrl.deleteItem(type, id);
            uiCtrl.deleteListItem(itemId);
            updateBudget();
            updatePercentages();

        }
    };

    return {
        init: function () {
            setupEventListeners();
            uiCtrl.displayBudget({
                budget: 0,
                totalInc: 0,
                totalExp: 0,
                percentage: -1
            });
            uiCtrl.displayDate();
            console.log('Application has started!');
        }
    }

})(budgetController, uiController);

controller.init();