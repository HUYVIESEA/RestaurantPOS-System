FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS base
WORKDIR /app
EXPOSE 5001
ENV ASPNETCORE_URLS=http://+:5001
ENV ASPNETCORE_ENVIRONMENT=Production

FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /src
COPY ["RestaurantPOS.Shared/RestaurantPOS.Shared.csproj", "RestaurantPOS.Shared/"]
COPY ["RestaurantPOS.OrderService/RestaurantPOS.OrderService.csproj", "RestaurantPOS.OrderService/"]
RUN dotnet restore "RestaurantPOS.OrderService/RestaurantPOS.OrderService.csproj"
COPY ["RestaurantPOS.Shared/", "RestaurantPOS.Shared/"]
COPY ["RestaurantPOS.OrderService/", "RestaurantPOS.OrderService/"]
WORKDIR "/src/RestaurantPOS.OrderService"
RUN dotnet build -c Release -o /app/build

FROM build AS publish
RUN dotnet publish -c Release -o /app/publish /p:UseAppHost=false

FROM base AS final
WORKDIR /app
COPY --from=publish /app/publish .
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://localhost:5001/health/ready || exit 1
ENTRYPOINT ["dotnet", "RestaurantPOS.OrderService.dll"]
