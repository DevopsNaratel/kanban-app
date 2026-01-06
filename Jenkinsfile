pipeline {
    agent any

    environment {
        APP_NAME          = 'kanban-app'
        DOCKER_IMAGE_FE   = "diwamln/${APP_NAME}-frontend"
        DOCKER_IMAGE_BE   = "diwamln/${APP_NAME}-backend"
        DOCKER_CREDS      = 'docker-hub'
        GIT_CREDS         = 'git-token'
        MANIFEST_REPO_URL = 'https://github.com/DevopsNaratel/deployment-manifests.git'
        MANIFEST_DEV_PATH_FE  = "${APP_NAME}-frontend/dev/deployment.yaml"
        MANIFEST_DEV_PATH_BE  = "${APP_NAME}-backend/dev/deployment.yaml"
        MANIFEST_PROD_PATH_FE = "${APP_NAME}-frontend/prod/deployment.yaml"
        MANIFEST_PROD_PATH_BE = "${APP_NAME}-backend/prod/deployment.yaml"
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

        stage('Build & Push Backend') {
            steps {
                container('docker') {
                    withCredentials([
                        usernamePassword(credentialsId: "${DOCKER_CREDS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')
                    ]) {
                        sh """
                            docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
                            
                            # Build backend
                            docker build \
                                --network=host \
                                -t ${DOCKER_IMAGE_BE}:${env.BASE_TAG} \
                                -f backend/Dockerfile \
                                ./backend
                            
                            # Push backend
                            docker push ${DOCKER_IMAGE_BE}:${env.BASE_TAG}
                            docker tag ${DOCKER_IMAGE_BE}:${env.BASE_TAG} ${DOCKER_IMAGE_BE}:latest
                            docker push ${DOCKER_IMAGE_BE}:latest
                        """
                    }
                }
            }
        }

        stage('Build & Push Frontend') {
            steps {
                container('docker') {
                    withCredentials([
                        usernamePassword(credentialsId: "${DOCKER_CREDS}", passwordVariable: 'DOCKER_PASSWORD', usernameVariable: 'DOCKER_USERNAME')
                    ]) {
                        sh """
                            docker login -u ${DOCKER_USERNAME} -p ${DOCKER_PASSWORD}
                            
                            # Build frontend
                            docker build \
                                --network=host \
                                -t ${DOCKER_IMAGE_FE}:${env.BASE_TAG} \
                                -f frontend/Dockerfile \
                                ./frontend
                            
                            # Push frontend
                            docker push ${DOCKER_IMAGE_FE}:${env.BASE_TAG}
                            docker tag ${DOCKER_IMAGE_FE}:${env.BASE_TAG} ${DOCKER_IMAGE_FE}:latest
                            docker push ${DOCKER_IMAGE_FE}:latest
                        """
                    }
                }
            }
        }

        stage('Update Manifest DEV') {
            steps {
                script {
                    updateManifest('dev', env.MANIFEST_DEV_PATH_BE, env.DOCKER_IMAGE_BE)
                    updateManifest('dev', env.MANIFEST_DEV_PATH_FE, env.DOCKER_IMAGE_FE)
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
                    updateManifest('prod', env.MANIFEST_PROD_PATH_BE, env.DOCKER_IMAGE_BE)
                    updateManifest('prod', env.MANIFEST_PROD_PATH_FE, env.DOCKER_IMAGE_FE)
                }
            }
        }
    }
    
    post {
        always {
            cleanWs()
        }
        success {
            echo "✅ Pipeline completed successfully!"
            echo "Backend Image: ${DOCKER_IMAGE_BE}:${env.BASE_TAG}"
            echo "Frontend Image: ${DOCKER_IMAGE_FE}:${env.BASE_TAG}"
        }
        failure {
            echo "❌ Pipeline failed!"
        }
    }
}

def updateManifest(envName, filePath, dockerImage) {
    withCredentials([usernamePassword(
        credentialsId: "${env.GIT_CREDS}", 
        passwordVariable: 'GIT_PASSWORD', 
        usernameVariable: 'GIT_USERNAME'
    )]) {
        sh """
            git config --global user.email "jenkins@bot.com"
            git config --global user.name "Jenkins Bot"
            rm -rf temp_manifest_${envName}_${dockerImage.tokenize('/')[-1]}
            git clone ${env.MANIFEST_REPO_URL} temp_manifest_${envName}_${dockerImage.tokenize('/')[-1]}
            cd temp_manifest_${envName}_${dockerImage.tokenize('/')[-1]}
            sed -i "s|image: ${dockerImage}:.*|image: ${dockerImage}:${env.BASE_TAG}|g" ${filePath}
            git add .
            git commit -m "deploy: update ${dockerImage.tokenize('/')[-1]} to ${envName} image ${env.BASE_TAG}" || true
            git push https://${GIT_USERNAME}:${GIT_PASSWORD}@github.com/DevopsNaratel/deployment-manifests.git main
            cd ..
            rm -rf temp_manifest_${envName}_${dockerImage.tokenize('/')[-1]}
        """
    }
}
