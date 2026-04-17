"""
Setup configuration for Pipeline AI Integration Manager Backend
==============================================================
"""

from setuptools import setup, find_packages

with open("README.md", "r", encoding="utf-8") as fh:
    long_description = fh.read()

with open("requirements.txt", "r", encoding="utf-8") as fh:
    requirements = [line.strip() for line in fh if line.strip() and not line.startswith("#")]

setup(
    name="pipeline-ai-integration-manager",
    version="0.1.0",
    author="Pipeline AI",
    author_email="dev@pipeline-ai.com",
    description="OAuth2 integration manager for multiple platforms",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://github.com/mevirajsheoran/hubspot-oauth-fastapi-react",
    packages=find_packages(),
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Framework :: FastAPI",
        "Topic :: Internet :: WWW/HTTP :: HTTP Servers",
        "Topic :: Software Development :: Libraries :: Application Frameworks",
    ],
    python_requires=">=3.9",
    install_requires=requirements,
    extras_require={
        "dev": [
            "pytest>=7.0.0",
            "pytest-asyncio>=0.21.0",
            "black>=23.0.0",
            "flake8>=6.0.0",
            "mypy>=1.0.0",
            "httpx>=0.24.0",
        ],
    },
    entry_points={
        "console_scripts": [
            "pipeline-ai=main:main",
        ],
    },
    include_package_data=True,
    zip_safe=False,
)
