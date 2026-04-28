@echo off
setx MVN_HOME "D:\apache-maven-3.9.6"
setx PATH "%%MVN_HOME%%\bin;%%PATH%%"
echo Maven has been added to your system PATH.
echo.
echo IMPORTANT: Close and reopen your terminal/window for this to take effect.
echo Then run: mvn --version
echo.
echo Or you can use Maven immediately with the full path:
echo   D:\apache-maven-3.9.6\bin\mvn --version
echo   D:\apache-maven-3.9.6\bin\mvnw.cmd spring-boot:run
echo.
echo To run the backend right now:
echo   cd D:\ClaudeProject\backend
echo   D:\apache-maven-3.9.6\bin\mvn spring-boot:run
