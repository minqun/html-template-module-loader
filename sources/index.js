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
    
        const getDataKey = [];
        const pattern = /{{\s*([^{}^\s]*)\s*}}/g
        let match;
        if (node.nodeName == "#text") {
        while ((match = pattern.exec(node.value)) !== null) {
            // 去掉空格
            const trimmedMatch = match[1]
            getDataKey.push(trimmedMatch);
        }
        console.log(getDataKey, 'getDataKey')
        getDataKey.forEach(item => {
            let keyValueStr = data.match(new RegExp(`\"${item}\":[ ]{0,}\"([^\",]*)\"`, 'g')) && data.match(new RegExp(`\"${item}\":[ ]{0,}\"([^\",]*)\"`, 'g'))[0]
            let getDatakeyValue = keyValueStr || ''
            let getDataValue = getDatakeyValue.replace(new RegExp(`\"${item}\":[ ]{0,}\"(.*)\"`), '$1')
            if (node.nodeName == "#text") {
                node.value = node.value.replace(new RegExp(`{{${item}}}|{{ ${item} }}`, 'g'), getDataValue)
            } 
        })
    } else {
        node.attrs && node.attrs.forEach(nodeAttr => {
            const getDataKeyAt = []
            while ((match = pattern.exec(nodeAttr.value)) !== null) {
                // 去掉空格
                const trimmedMatch = match[1]
                getDataKeyAt.push(trimmedMatch);
            }
            getDataKeyAt.forEach(item => {
            let keyValueStr = data.match(new RegExp(`\"${item}\":[ ]{0,}\"([^\",]*)\"`, 'g')) && data.match(new RegExp(`\"${item}\":[ ]{0,}\"([^\",]*)\"`, 'g'))[0]

                let getDatakeyValue =  keyValueStr || ''
                let getDataValue = getDatakeyValue.replace(new RegExp(`\"${item}\":[ ]{0,}\"(.*)\"`), '$1')
                nodeAttr.value = nodeAttr.value.replace(new RegExp(`{{${item}}}|{{ ${item} }}`, 'g'), getDataValue)
                console.log( node.attrs, node, 'arrts-------')
            })
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
