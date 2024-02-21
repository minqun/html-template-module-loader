const configObject =  {
    
    production: {

    }
}

exports.config = {type: process.env.NODE_ENV, ...configObject[process.env.production] || configObject['production']}