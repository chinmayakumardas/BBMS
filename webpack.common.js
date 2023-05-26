const path = require('path');
const HtmlWebpackPlugin  = require("html-webpack-plugin");
module.exports = {
  entry: './src/index.js',
  plugins:[new HtmlWebpackPlugin({
  	 template:"./src/index.html"
    })
   

  ],
  
   module: {
    rules: [
      {
        test: /\.css$/i,
        use: ['style-loader', 'css-loader','postcss-loader'],
      },  
      {
        test: /\.html$/i,
        use: 'html-loader'
      },
      {
        test: /\.(svg|png|jpg|jpeg)$/i,
        use:[{
          loader:"file-loader",
          options:{
             name:"[name].[hash].[ext]",
             outputPath:"imags",
              esModule: false
          }

        }
        ],
      },
    ],
  },
  };