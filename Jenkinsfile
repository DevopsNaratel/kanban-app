pipeline {
    agent any

    environment {
        APP_NAME          = 'kanban-app'
        DOCKER_IMAGE_FE   = "diwamln/${APP_NAME}-frontend"
        DOCKER_IMAGE_BE   = "diwamln/${APP_NAME}-backend"
        DOCKER_CREDS      = 'docker-cred' 
        GIT_CREDS         = 'git-token'   
        MANIFEST_REPO_URL = 'github.com/DevopsNaratel/deployment-manifests.git'
        
        FE_DEV_PATH   = "kanban-app-frontend/dev/deployment.yaml"
        BE_DEV_PATH   = "kanban-app-backend/dev/deployment.yaml"
        FE_PROD_PATH  = "kanban-app-frontend/prod/deployment.yaml"
        BE_PROD_PATH  = "kanban-app-backend/prod/deployment.yaml"
    }

    stages {
        stage('Checkout & Versioning') {
            steps {
                checkout scm
                script {
                    def commitHash = sh(returnStdout: true, script: "git rev-parse --short HEAD").trim()
                    env.BASE_TAG = "build-${BUILD_NUMBER}-${commitHash}"
                    currentBuild.displayName = "#${BUILD_NUMBER} (${env.BASE_TAG})"
                }
            }
        }

        stage('Build & Push (DEV)') {
            steps {
                // Menggunakan credentials binding manual agar lebih stabil
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh """
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        
                        # Build & Push Backend
                        docker build -t ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-dev -f backend/Dockerfile ./backend
                        docker push ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-dev

                        # Build & Push Frontend
                        docker build -t ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-dev -f frontend/Dockerfile ./frontend
                        docker push ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-dev
                    """
                }
            }
        }

        stage('Update Manifest (DEV)') {
            steps {
                script {
                    sh 'rm -rf temp_manifests'
                    dir('temp_manifests') {
                        withCredentials([usernamePassword(credentialsId: GIT_CREDS, usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                            sh """
                                git clone https://${GIT_USER}:${GIT_PASS}@${MANIFEST_REPO_URL} .
                                git config user.email "jenkins@bot.com"
                                git config user.name "Jenkins Pipeline"
                                
                                sed -i "s|image: ${DOCKER_IMAGE_BE}:.*|image: ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-dev|g" ${BE_DEV_PATH}
                                sed -i "s|image: ${DOCKER_IMAGE_FE}:.*|image: ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-dev|g" ${FE_DEV_PATH}
                                
                                git add .
                                git commit -m "Deploy DEV: ${env.BASE_TAG} [skip ci]" || true
                                git push origin main
                            """
                        }
                    }
                }
            }
        }

        stage('Approval') {
            steps {
                input message: "Lanjut ke PROD?", ok: "Deploy!"
            }
        }

        stage('Promote to PROD') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh """
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        
                        # Retag Backend
                        docker pull ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-dev
                        docker tag ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-dev ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-prod
                        docker tag ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-dev ${DOCKER_IMAGE_BE}:latest
                        docker push ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-prod
                        docker push ${DOCKER_IMAGE_BE}:latest

                        # Retag Frontend
                        docker pull ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-dev
                        docker tag ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-dev ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-prod
                        docker tag ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-dev ${DOCKER_IMAGE_FE}:latest
                        docker push ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-prod
                        docker push ${DOCKER_IMAGE_FE}:latest
                    """
                }
            }
        }

        stage('Update Manifest (PROD)') {
            steps {
                script {
                    dir('temp_manifests') {
                        withCredentials([usernamePassword(credentialsId: GIT_CREDS, usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                            sh """
                                git pull origin main
                                sed -i "s|image: ${DOCKER_IMAGE_BE}:.*|image: ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-prod|g" ${BE_PROD_PATH}
                                sed -i "s|image: ${DOCKER_IMAGE_FE}:.*|image: ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-prod|g" ${FE_PROD_PATH}
                                git add .
                                git commit -m "Promote PROD: ${env.BASE_TAG} [skip ci]" || true
                                git push origin main
                            """
                        }
                    }
                }
            }
        }
    }
}
