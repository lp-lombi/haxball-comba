@echo off

cd /D "%~dp0"
call npm i
cls
node main.js