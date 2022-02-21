# ets

Now this project is offically maintained.  
Looking for new name, [new a issue](http://github.com/HomeworkCLI/ets/issues/new) to tell us your idea.

## Usage

### Args

\$node index.js -h  
Usage: node index.js [options]  
  
Options:  
&emsp;-p, --path \<path\>      path to file to be uploaded  
&emsp;-t, --thread \<number\>  number of threads to use  
&emsp;-h, --help             display help for command  

### Setup

#### 1. Build from source

Assuming you are fimilar with Git, Node.js and Scoop.  

```bash
# environment setup
scoop install git
scoop install nodejs
npm install -g yarn
# Or use mirror for China Mainland
# npm install -g yarn --registry=https://registry.npmmirror.com
# environment setup end

git clone https://github.com/HomeworkCLI/ets.git
# Or use ghproxy for China Mainland
# git clone https://ghproxy.com/https://github.com/HomeworkCLI/ets.git
cd ./ets/
yarn install
yarn global add typescript
tsc
cd ./build/
node index.js -p <path to file or folder> -t <thread number>
```

#### 2. Executable file

For executable file, use ``index.exe`` instead of ``node index.js``  
Download from [Releases](http://github.com/HomeworkCLI/ets/releases/latest)
