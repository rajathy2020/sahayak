FROM nginx:1.20

WORKDIR /etc/nginx

RUN rm /etc/nginx/conf.d/default.conf

#Nginx Config
COPY build_new/frontend/nginx.conf/ /etc/nginx/

#Site Config
COPY build_new/frontend/conf/ /etc/nginx/conf/
COPY build_new/frontend/sites/fraud-detection-fe.conf /etc/nginx/conf.d/fraud-detection-fe.conf