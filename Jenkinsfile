pipeline {
    agent any

    environment {
        APP_NAME          = 'kanban-app'
        DOCKER_IMAGE_FE   = "diwamln/${APP_NAME}-frontend"
        DOCKER_IMAGE_BE   = "diwamln/${APP_NAME}-backend"
        DOCKER_CREDS      = 'docker-cred' // Sesuaikan dengan ID di Jenkins Anda
        GIT_CREDS         = 'git-token'   // Sesuaikan dengan ID di Jenkins Anda
        MANIFEST_REPO_URL = 'github.com/DevopsNaratel/deployment-manifests.git'
        
        // Path Manifest
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

        stage('Build & Push (DEV Image)') {
            steps {
                script {
                    docker.withRegistry('', DOCKER_CREDS) {
                        // Build & Push Backend
                        echo "Building Backend DEV..."
                        def beImage = docker.build("${DOCKER_IMAGE_BE}:${env.BASE_TAG}-dev", "-f backend/Dockerfile ./backend")
                        beImage.push()

                        // Build & Push Frontend
                        echo "Building Frontend DEV..."
                        def feImage = docker.build("${DOCKER_IMAGE_FE}:${env.BASE_TAG}-dev", "-f frontend/Dockerfile ./frontend")
                        feImage.push()
                    }
                }
            }
        }

        stage('Update Manifest (DEV)') {
            steps {
                script {
                    sh 'rm -rf temp_manifests'
                    dir('temp_manifests') {
                        withCredentials([usernamePassword(credentialsId: GIT_CREDS, usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                            sh "git clone https://${GIT_USER}:${GIT_PASS}@${MANIFEST_REPO_URL} ."
                            sh 'git config user.email "jenkins@bot.com"'
                            sh 'git config user.name "Jenkins Pipeline"'
                            
                            // Update Backend & Frontend Image
                            sh "sed -i 's|image: ${DOCKER_IMAGE_BE}:.*|image: ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-dev|g' ${BE_DEV_PATH}"
                            sh "sed -i 's|image: ${DOCKER_IMAGE_FE}:.*|image: ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-dev|g' ${FE_DEV_PATH}"
                            
                            sh "git add ."
                            sh "git commit -m 'Deploy DEV: ${env.BASE_TAG} [skip ci]'"
                            sh "git push origin main"
                        }
                    }
                }
            }
        }

        stage('Approval for Production') {
            steps {
                input message: "Versi DEV (${env.BASE_TAG}-dev) sudah ok? Lanjut ke PROD?", ok: "Deploy ke Prod!"
            }
        }

        stage('Promote to PROD Image') {
            steps {
                script {
                    docker.withRegistry('', DOCKER_CREDS) {
                        // Promote Backend
                        def beDevImage = docker.image("${DOCKER_IMAGE_BE}:${env.BASE_TAG}-dev")
                        beDevImage.pull()
                        beDevImage.push("${env.BASE_TAG}-prod")
                        beDevImage.push("latest")

                        // Promote Frontend
                        def feDevImage = docker.image("${DOCKER_IMAGE_FE}:${env.BASE_TAG}-dev")
                        feDevImage.pull()
                        feDevImage.push("${env.BASE_TAG}-prod")
                        feDevImage.push("latest")
                    }
                }
            }
        }

        stage('Update Manifest (PROD)') {
            steps {
                script {
                    dir('temp_manifests') {
                        withCredentials([usernamePassword(credentialsId: GIT_CREDS, usernameVariable: 'GIT_USER', passwordVariable: 'GIT_PASS')]) {
                            sh "git pull origin main"
                            
                            // Update Backend & Frontend Image
                            sh "sed -i 's|image: ${DOCKER_IMAGE_BE}:.*|image: ${DOCKER_IMAGE_BE}:${env.BASE_TAG}-prod|g' ${BE_PROD_PATH}"
                            sh "sed -i 's|image: ${DOCKER_IMAGE_FE}:.*|image: ${DOCKER_IMAGE_FE}:${env.BASE_TAG}-prod|g' ${FE_PROD_PATH}"
                            
                            sh "git add ."
                            sh "git commit -m 'Promote PROD: ${env.BASE_TAG} [skip ci]'"
                            sh "git push origin main"
                        }
                    }
                }
            }
        }
    }

    post {
        always {
            sh 'rm -rf temp_manifests'
            cleanWs()
        }
    }
}