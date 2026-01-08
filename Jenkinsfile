pipeline {
    agent any

    environment {
        APP_NAME          = 'kanban-app'
        DOCKER_IMAGE_FE   = "devopsnaratel/${APP_NAME}-frontend"
        DOCKER_IMAGE_BE   = "devopsnaratel/${APP_NAME}-backend"
        DOCKER_CREDS      = 'docker-hub' 
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

        stage('Build & Push Dev') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh """
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        
                        # Build & Push Backend Dev
                        docker build -t ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-dev -f backend/Dockerfile ./backend
                        docker push ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-dev

                        # Build & Push Frontend Dev
                        docker build -t ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-dev -f frontend/Dockerfile ./frontend
                        docker push ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-dev
                    """
                }
            }
        }

        stage('Update Manifest Dev') {
            steps {
                script {
                    sh 'rm -rf temp_manifests_dev'
                    dir('temp_manifests_dev') {
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

        // --- TAHAP APPROVAL ---
        stage('Approval Production') {
            steps {
                input message: "Apakah Anda yakin ingin deploy ke Production?", ok: "Ya, Deploy ke Prod"
            }
        }

        stage('Push Production Image') {
            steps {
                withCredentials([usernamePassword(credentialsId: "${DOCKER_CREDS}", passwordVariable: 'DOCKER_PASS', usernameVariable: 'DOCKER_USER')]) {
                    sh """
                        echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin
                        
                        # Retag Image Dev ke Prod (Best Practice: Image yang sama, beda tag)
                        docker tag ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-dev ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-prod
                        docker push ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-prod

                        docker tag ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-dev ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-prod
                        docker push ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-prod
                    """
                }
            }
        }

        stage('Update Manifest Production') {
            steps {
                script {
                    sh 'rm -rf temp_manifests_prod'
                    dir('temp_manifests_prod') {
                        withCredentials([usernamePassword(credentialsId: GIT_CREDS, usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                            sh """
                                git clone https://${GIT_USER}:${GIT_PASS}@${MANIFEST_REPO_URL} .
                                git config user.email "jenkins@bot.com"
                                git config user.name "Jenkins Pipeline"
                                
                                # Update manifest untuk path PROD
                                sed -i "s|image: ${DOCKER_IMAGE_BE}:.*|image: ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-prod|g" ${BE_PROD_PATH}
                                sed -i "s|image: ${DOCKER_IMAGE_FE}:.*|image: ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-prod|g" ${FE_PROD_PATH}
                                
                                git add .
                                git commit -m "Deploy PROD: ${env.BASE_TAG} [skip ci]" || true
                                git push origin main
                            """
                        }
                    }
                }
            }
        }
    }
}
