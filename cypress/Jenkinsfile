pipeline {
  agent any
  triggers { githubPush() }
  environment {
    CYPRESS_CACHE_FOLDER = 'C:\\CypressCache'
    NODE_CACHE_FOLDER    = 'C:\\CypressNodeModules'
    PROJECT_DIR          = "${env.WORKSPACE}"
  }
  stages {
    stage('Checkout') {
      steps {
        checkout scm
      }
    }

    stage('Prepare cache and install') {
      steps {
        script {
          // Use a single batch block to run Windows commands in same shell
          bat """
            @echo off
            setlocal

            set CYPRESS_CACHE_FOLDER=${env.CYPRESS_CACHE_FOLDER}
            set NODE_PATH=${env.NODE_CACHE_FOLDER}
            set PROJECT_DIR=${env.PROJECT_DIR}

            if not exist "%NODE_PATH%\\node_modules" (
              echo === First-time setup: installing dependencies and Cypress ===
              mkdir "%NODE_PATH%" 2>nul
              cd /d "%PROJECT_DIR%"
              npm ci --prefix "%NODE_PATH%" --no-audit --no-fund
              npx cypress install
            ) else (
              echo === Using cached dependencies and Cypress ===
            )

            endlocal
          """
        }
      }
    }

    stage('Run Cypress') {
      steps {
        bat """
          @echo off
          setlocal
          chcp 65001
          set FORCE_COLOR=0
          cd /d "%WORKSPACE%"
          npx cypress run --browser chrome --headless --spec cypress\\e2e\\tests\\component\\CreateClinic.cy.js
          exit /b %errorlevel%
        """
      }
    }
  }

  post {
    always {
      archiveArtifacts artifacts: 'cypress/screenshots/**/*, cypress/videos/**/*', allowEmptyArchive: true
      junit allowEmptyResults: true, testResults: '**/cypress/results/*.xml'
    }
  }
}
