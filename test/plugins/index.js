const fs = require('fs')
const path = require('path')
const parseUtls = require('parse5-utils');

function findNode(node, tag, attrName, result) {
    if (node.tagName === tag && node.attrs) {
        const attr = node.attrs.find((attr) => attr.name === attrName);
        if (attr) {
        result.push(node);
        }
    }
    if (node.childNodes) {
        for (const childNode of node.childNodes) {
        findNode(childNode, tag, attrName, result);
        }
    }
}
function replaceTplData(node, data) {
    if (node.nodeName == "#text") {
        const getDataKey = [];
        const pattern = /{{\s*([^{}^\s]*)\s*}}/g
        let match;

        while ((match = pattern.exec(node.value)) !== null) {
            // 去掉空格
            const trimmedMatch = match[1]
            getDataKey.push(trimmedMatch);
        }
        getDataKey.forEach(item => {
            let getDatakeyValue = data.match(new RegExp(`\"${item}\":[ ]{0,}\"([^\",]*)\"`, 'g'))[0] || ''
            let getDataValue = getDatakeyValue.replace(new RegExp(`\"${item}\":[ ]{0,}\"(.*)\"`), '$1')
            node.value = node.value.replace(new RegExp(`{{${item}}}|{{ ${item} }}`, 'g'), getDataValue)
        })
    }
    if (node.childNodes) {
        for (const childNode of node.childNodes) {
            replaceTplData(childNode, data);
        }
    }
}
function findData(node, tag, attrName) {
    if (node.tagName === tag && node.attrs) {
        const data = node.attrs.find((attr) => attr.name === 'data');
        return data.value
    }
   
}
function getFileNode(file) {
    const content = fs.readFileSync(file, 'utf8')
    return parseUtls.parse(content)
}

function insertFileNodeToTargetNode (node, insertFile, insertTag, insertAttr, _this, data) {
    const options = _this.getOptions();
    const result = []
    const insertNode = getFileNode(insertFile)
    replaceTplToHtml(insertNode, options.tag, options.attr, _this)
    findNode(insertNode, 'div', 'tpl', result)
    if (data) {
        console.log(result, 'result', data)
        replaceTplData(insertNode,  data)
    }
   
    let newNode = parseUtls.createNode('div')
    newNode.childNodes = result[0].childNodes
   
    parseUtls.replace(node, newNode)
}
function replaceTplToHtml(node, tag, attrName, _this) {
    const options = _this.getOptions();
    if (node.tagName === tag) {
        const src = node.attrs.find(attr => attr.name == options.attr).value;
        const data = node.attrs.find(attr => attr.name == 'data')?.value;
        if (src) {
            _this.addDependency(path.resolve(src));
            insertFileNodeToTargetNode(node, path.resolve(src), 'div', 'tpl', _this, data)
        }
    }
    if (node.childNodes) {
        for (const childNode of node.childNodes) {
            replaceTplToHtml(childNode, tag, attrName, _this);
        }
    }
}

module.exports = async function (source) {
    const options = this.getOptions();
    var callback = this.async();
    var document = parseUtls.parse(source)
    replaceTplToHtml(document, options.tag, options.attr, this)
    const html = parseUtls.serialize(document)
   
    callback(null, html)
    this.cacheable(false)
}
module.exports.raw = false;
