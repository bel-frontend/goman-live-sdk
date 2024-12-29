from setuptools import setup, find_packages

setup(
    name='goman_live_sdk',
    version='0.1.10',
    packages=find_packages(),
    install_requires=[
        'requests>=2.20,<3.0',  # Add any dependencies here
        'websocket-client>=1.7.0,<2.0', 
    ],
    description='A Python SDK for fetching and managing prompts by goman.live',
    long_description=open('README.md').read(),
    long_description_content_type='text/markdown',
    author='goman.live',
    author_email='goman.live.service@gmail.com',
    url='https://github.com/bel-frontend/goman-live-sdk',
    classifiers=[
        'Programming Language :: Python :: 3',
        'License :: OSI Approved :: MIT License',
        'Operating System :: OS Independent',
    ],
    python_requires='>=3.6',
)
