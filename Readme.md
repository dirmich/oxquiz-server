Installing Docker and Docker compose in Centos 6.9 with kernel 2.6.32-696.23.1.el6.x86_64

[Installing Docker]
rpm -iUvh http://dl.fedoraproject.org/pub/epel/6/x86_64/epel-release-6-8.noarch.rpm && \
yum update -y && \
yum -y install docker-io && \
service docker start

[Installing Docker compose]
curl -L https://github.com/docker/compose/releases/download/1.5.2/docker-compose-`uname -s`-`uname -m` > /usr/local/bin/docker-compose && \
chmod +x /usr/local/bin/docker-compose && \
mount /tmp -o remount,exec