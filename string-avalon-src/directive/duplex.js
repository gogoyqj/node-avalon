//双工绑定
var duplexBinding = bindingHandlers.duplex = function (data, vmodels) {
    var elem = data.element,
            hasCast
    var params = []
    var casting = oneObject("string,number,boolean,checked")
    if (elem.type === "radio" && data.param === "") {
        data.param = "checked"
    }
    if (elem.msData) {
        elem.msData["ms-duplex"] = data.value
    }
    data.param.replace(/\w+/g, function (name) {
        if (/^(checkbox|radio)$/.test(elem.type) && /^(radio|checked)$/.test(name)) {
            if (name === "radio")
                log("ms-duplex-radio已经更名为ms-duplex-checked")
            name = "checked"
            data.isChecked = true
        }
        if (name === "bool") {
            name = "boolean"
            log("ms-duplex-bool已经更名为ms-duplex-boolean")
        } else if (name === "text") {
            name = "string"
            log("ms-duplex-text已经更名为ms-duplex-string")
        }
        if (casting[name]) {
            hasCast = true
        }
        avalon.Array.ensure(params, name)
    })
    if (!hasCast) {
        params.push("string")
    }
    data.param = params.join("-")
    data.pipe = pipe
    parseExprProxy(data.value, vmodels, data)
}
//不存在 bindingExecutors.duplex
function fixNull(val) {
    return val == null ? "" : val
}
avalon.duplexHooks = {
    checked: {
        get: function (val, data) {
            return !data.element.oldValue
        }
    },
    string: {
        get: function (val) { //同步到VM
            return val
        },
        set: fixNull
    },
    "boolean": {
        get: function (val) {
            return val === "true"
        },
        set: fixNull
    },
    number: {
        get: function (val, data) {
            var number = parseFloat(val)
            if (-val === -number) {
                return number
            }
            var arr = /strong|medium|weak/.exec(DOM.getAttribute(data.element, "data-duplex-number")) || ["medium"]
            switch (arr[0]) {
                case "strong":
                    return 0
                case "medium":
                    return val === "" ? "" : 0
                case "weak":
                    return val
            }
        },
        set: fixNull
    }
}

function pipe(val, data, action, e) {
    data.param.replace(/\w+/g, function (name) {
        var hook = avalon.duplexHooks[name]
        if (hook && typeof hook[action] === "function") {
            val = hook[action](val, data)
        }
    })
    return val
}

bindingExecutors.duplex = function (val, elem, data) {
    duplexProxy[elem.nodeName.toLowerCase()](val, elem, data)
}

var duplexProxy = {}

duplexProxy.input = function (val, elem, data) {
    var $type = DOM.getAttribute(elem, "type")
    var elemValue = DOM.getAttribute(elem, "value")

    if (data.isChecked || $type === "radio") {
        var checked = data.isChecked ? !!val : val + "" === elemValue
        DOM.setBoolAttribute(elem, "checked", checked)
        DOM.setAttribute(elem, "oldValue", String(checked))
        var needSet = true
    } else if ($type === "checkbox") {
        var array = [].concat(val) //强制转换为数组
        var checked = array.indexOf(data.pipe(elemValue, data, "get")) > -1
        DOM.setBoolAttribute(elem, "checked", checked)
    } else {
        val = data.pipe(val, data, "set")
        DOM.setAttribute(elem, "value", String(val))
    }
    if (!needSet)
        DOM.setAttribute(elem, "oldValue", String(oldValue))
}
duplexProxy.textarea = function (val, elem, data) {
    val = data.pipe(val, data, "set")
    elem.childNodes.splice(0, 1, {
        nodeName: "#text",
        value: val,
        nodeType: 1,
        parentNode: elem
    })
}
duplexProxy.select = function (val, elem) {
    val = Array.isArray(val) ? val.map(String) : val + ""
    DOM.setAttribute(elem, "oldValue", String(val))
    elem.duplexCallback = function () {
        avalon(elem).val(val)
    }
}