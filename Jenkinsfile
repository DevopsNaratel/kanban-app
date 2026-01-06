pipeline {
    agent any

    environment {
        APP_NAME          = 'kanban-app'
        DOCKER_IMAGE_FE   = "diwamln/${APP_NAME}-frontend"
        DOCKER_IMAGE_BE   = "diwamln/${APP_NAME}-backend"
        DOCKER_CREDS      = 'docker-cred'
        GIT_CREDS         = 'git-token'
        MANIFEST_REPO_URL = 'github.com/DevopsNaratel/deployment-manifests.git'
    }

    stages {
        stage('Checkout & Versioning') {
            steps {
                checkout scm
                script {
                    def commitHash = sh(returnStdout: true, script: "git rev-parse --short HEAD").trim()
                    env.BASE_TAG = "build-${BUILD_NUMBER}-${commitHash}"
                    currentBuild.displayName = "#${BUILD_NUMBER}-${env.BASE_TAG}"
                }
            }
        }

        stage('Build & Push Images') {
            steps {
                script {
                    // Menggunakan docker.withRegistry lebih aman daripada docker login manual
                    docker.withRegistry('https://index.docker.io/v1/', "${DOCKER_CREDS}") {
                        
                        // Backend
                        def beImage = docker.build("${DOCKER_IMAGE_BE}:${env.BASE_TAG}", "-f backend/Dockerfile ./backend")
                        beImage.push()
                        beImage.push('latest')

                        // Frontend
                        def feImage = docker.build("${DOCKER_IMAGE_FE}:${env.BASE_TAG}", "-f frontend/Dockerfile ./frontend")
                        feImage.push()
                        feImage.push('latest')
                    }
                }
            }
        }

        stage('Update Manifest DEV') {
            steps {
                script {
                    // Update sekaligus dalam satu kali clone untuk efisiensi
                    updateManifests('dev', [
                        [path: "${APP_NAME}-backend/dev/deployment.yaml", image: env.DOCKER_IMAGE_BE],
                        [path: "${APP_NAME}-frontend/dev/deployment.yaml", image: env.DOCKER_IMAGE_FE]
                    ])
                }
            }
        }

        stage('Approval to PROD') {
            steps {
                input message: "Promote to PROD?", ok: "Yes, Deploy!"
            }
        }

        stage('Promote to PROD') {
            steps {
                script {
                    updateManifests('prod', [
                        [path: "${APP_NAME}-backend/prod/deployment.yaml", image: env.DOCKER_IMAGE_BE],
                        [path: "${APP_NAME}-frontend/prod/deployment.yaml", image: env.DOCKER_IMAGE_FE]
                    ])
                }
            }
        }
    }
    
    // ... post section tetap sama ...
}

def updateManifests(envName, updates) {
    withCredentials([usernamePassword(credentialsId: "${env.GIT_CREDS}", passwordVariable: 'GIT_PASSWORD', usernameVariable: 'GIT_USERNAME')]) {
        sh """
            git config --global user.email "jenkins@bot.com"
            git config --global user.name "Jenkins Bot"
            rm -rf temp_manifest_${envName}
            git clone https://${GIT_USERNAME}:${GIT_PASSWORD}@${env.MANIFEST_REPO_URL} temp_manifest_${envName}
            cd temp_manifest_${envName}
            
            ${updates.collect { "sed -i 's|image: ${it.image}:.*|image: ${it.image}:${env.BASE_TAG}|g' ${it.path}" }.join('\n')}
            
            git add .
            git commit -m "deploy: update images to ${envName} version ${env.BASE_TAG}" || true
            git push origin main
            cd ..
            rm -rf temp_manifest_${envName}
        """
    }
}