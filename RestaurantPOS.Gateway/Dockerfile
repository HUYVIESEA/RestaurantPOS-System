FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 8080
ENV ASPNETCORE_URLS=http://+:8080
ENV ASPNETCORE_ENVIRONMENT=Production

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["RestaurantPOS.Gateway/RestaurantPOS.Gateway.csproj", "RestaurantPOS.Gateway/"]
RUN dotnet restore "RestaurantPOS.Gateway/RestaurantPOS.Gateway.csproj"
COPY ["RestaurantPOS.Gateway/", "RestaurantPOS.Gateway/"]
WORKDIR "/src/RestaurantPOS.Gateway"
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:8080/health || exit 1
ENTRYPOINT ["dotnet", "RestaurantPOS.Gateway.dll"]
