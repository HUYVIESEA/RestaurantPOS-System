FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5000
ENV ASPNETCORE_URLS=http://+:5000
ENV ASPNETCORE_ENVIRONMENT=Production

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
ARG BUILD_CONFIGURATION=Release
WORKDIR /src
COPY ["RestaurantPOS.API/RestaurantPOS.API.csproj", "RestaurantPOS.API/"]
RUN dotnet restore "RestaurantPOS.API/RestaurantPOS.API.csproj"
COPY ["RestaurantPOS.API/", "RestaurantPOS.API/"]
WORKDIR "/src/RestaurantPOS.API"
RUN dotnet build "RestaurantPOS.API.csproj" -c $BUILD_CONFIGURATION -o /app/build

FROM build AS publish
ARG BUILD_CONFIGURATION=Release
RUN dotnet publish "RestaurantPOS.API.csproj" -c $BUILD_CONFIGURATION -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
RUN mkdir -p /app/wwwroot/images/products
ENTRYPOINT ["dotnet", "RestaurantPOS.API.dll"]
