FROM python:3.9


# Switch to root user for installations
USER root

# Update and install required dependencies in a single layer
RUN apt-get update --fix-missing && \
    apt-get install -y \
    logrotate \
    python3-dev \
    vim \
    libenchant-2-2 \
    jq \
    ffmpeg \
    libsm6 \
    libxext6 \
    wget \
    unzip && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Upgrade pip and setuptools
RUN pip install --upgrade pip setuptools

# Install necessary Python packages in a single layer
RUN pip install \
    numpy \
    pandas \
    Werkzeug==2.0.0 \
    fastapi==0.60.1 \
    uvicorn \
    pyjwt \
    passlib[bcrypt] \
    httplib2 \
    "click<8" \
    jupyter \
    jupyterlab \
    nbslide \
    aiohttp \
    beanie \
    motor \
    openai==1.7.2 \
    stripe \
    twilio

# Set up Jupyter configuration
ARG TK_JUPYTER_PASSWD_HASH

RUN jupyter-lab --allow-root --generate-config && \
    jupyter notebook --allow-root --generate-config && \
    python -m ipykernel install --user && \
    mkdir -p /root/.ipython/profile_default && \
    touch /root/.ipython/profile_default/ipython_config.py && \
    echo "c.NotebookApp.allow_remote_access = True" >> /root/.jupyter/jupyter_lab_config.py && \
    echo "c.NotebookApp.allow_root = True" >> /root/.jupyter/jupyter_lab_config.py && \
    echo "c.NotebookApp.ip = '0.0.0.0'" >> /root/.jupyter/jupyter_lab_config.py && \
    echo "c.InteractiveShellApp.extensions = ['autoreload']" >> /root/.ipython/profile_default/ipython_config.py && \
    echo "c.InteractiveShellApp.exec_lines = ['%autoreload 2']" >> /root/.ipython/profile_default/ipython_config.py && \
    echo "c.NotebookApp.allow_remote_access = True" >> /root/.jupyter/jupyter_notebook_config.py && \
    echo "c.NotebookApp.allow_root = True" >> /root/.jupyter/jupyter_notebook_config.py && \
    echo "c.NotebookApp.ip = '0.0.0.0'" >> /root/.jupyter/jupyter_notebook_config.py

# Install envconsul
RUN wget -O setup.zip https://releases.hashicorp.com/envconsul/0.11.0/envconsul_0.11.0_linux_386.zip && \
    unzip setup.zip && \
    mv envconsul /usr/bin/ && \
    rm setup.zip

# Create necessary directories
RUN mkdir -p /data/tmp

# Set working directory
WORKDIR /backend
