#!/usr/bin/env node

const { execSync } = require('child_process');
const readline = require('readline');
const fs = require('fs');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

console.log('🚀 Preparing to deploy the Search Engine Crawler API to Vercel...\n');

// Check if vercel CLI is installed
try {
  execSync('vercel --version', { stdio: 'ignore' });
} catch (error) {
  console.log('❌ Vercel CLI is not installed. Installing it now...');
  try {
    execSync('npm install -g vercel', { stdio: 'inherit' });
    console.log('✅ Vercel CLI installed successfully.\n');
  } catch (installError) {
    console.error('❌ Failed to install Vercel CLI. Please install it manually with "npm install -g vercel"');
    process.exit(1);
  }
}

// Check if user is logged in to Vercel
try {
  execSync('vercel whoami', { stdio: 'ignore' });
  console.log('✅ You are already logged in to Vercel.\n');
} catch (error) {
  console.log('🔑 Please log in to your Vercel account:');
  try {
    execSync('vercel login', { stdio: 'inherit' });
    console.log('✅ Logged in to Vercel successfully.\n');
  } catch (loginError) {
    console.error('❌ Failed to log in to Vercel. Please try again manually with "vercel login"');
    process.exit(1);
  }
}

const askQuestion = (question) => {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
};

const deploy = async () => {
  try {
    // Ask for deployment type
    const isProd = await askQuestion('Deploy to production? (y/n): ');
    const prodFlag = isProd.toLowerCase() === 'y' ? '--prod' : '';
    
    console.log('\n🛠️ Running pre-deployment checks...');
    
    // Check if package.json exists
    if (!fs.existsSync(path.join(process.cwd(), 'package.json'))) {
      console.error('❌ package.json not found. Make sure you are in the project root directory.');
      process.exit(1);
    }
    
    // Check if vercel.json exists
    if (!fs.existsSync(path.join(process.cwd(), 'vercel.json'))) {
      console.log('⚠️ vercel.json not found. This might cause issues with API timeouts and memory limits.');
      const createConfig = await askQuestion('Create vercel.json configuration? (y/n): ');
      
      if (createConfig.toLowerCase() === 'y') {
        const config = {
          "version": 2,
          "builds": [
            {
              "src": "package.json",
              "use": "@vercel/next"
            }
          ],
          "routes": [
            {
              "src": "/api/(.*)",
              "headers": {
                "Access-Control-Allow-Origin": "*",
                "Access-Control-Allow-Methods": "GET, OPTIONS",
                "Access-Control-Allow-Headers": "Content-Type, Authorization"
              },
              "continue": true
            }
          ],
          "functions": {
            "api/**/*.js": {
              "memory": 3008,
              "maxDuration": 60
            }
          }
        };
        
        fs.writeFileSync(path.join(process.cwd(), 'vercel.json'), JSON.stringify(config, null, 2));
        console.log('✅ Created vercel.json configuration.\n');
      }
    }
    
    console.log('\n🚀 Starting deployment to Vercel...');
    console.log('⚠️ Note: During the deployment process, you will be asked for project details by Vercel CLI.\n');
    
    execSync(`vercel ${prodFlag}`, { stdio: 'inherit' });
    
    console.log('\n✅ Deployment completed successfully!');
    
    if (isProd.toLowerCase() === 'y') {
      console.log('\n🌐 Your production API is now live and ready for use.');
      console.log('📚 Access your API documentation at: https://your-project-name.vercel.app/api-docs');
    } else {
      console.log('\n🔍 Your preview deployment is ready for testing.');
      console.log('🔄 To deploy to production, run: node deploy.js and select "y" for production.');
    }
    
  } catch (error) {
    console.error('\n❌ Deployment failed:', error.message);
  } finally {
    rl.close();
  }
};

deploy(); 