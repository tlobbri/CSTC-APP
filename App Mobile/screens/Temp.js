import React from 'react';
import { View, Text, FlatList, ActivityIndicator, Image, TextInput, AsyncStorage} from "react-native";
import { List, ListItem, SearchBar } from "react-native-elements";
import {Header,Left,Icon} from 'native-base'
import '../src/components/global.js'

export default class Temp extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: false,
      data: [],
      error: null,
      refreshing: false,
      email:"",
      password:""
    };
  }
  
  static navigationOptions = {
    title: 'Modules',
  }

  componentDidMount() {
    this.getGlobal();
    this.makeRemoteRequest();
  }

  async getGlobal() {
    try {
      this.setState({ email: await AsyncStorage.getItem("global.Email")});
      this.setState({ password: await AsyncStorage.getItem("global.Pass")});
      
    } catch (error) {
      console.log("Something went wrong", error);
    }
  }

  makeRemoteRequest = () => {
    const url = `https://digitalconstructionhub.ovh/api/api.php?email=${this.state.email}&pass=${this.state.password}&asset=true`;
    this.setState({ loading: true });

    fetch(url)
      .then(res => res.json())
      .then(res => {
        this.setState({
          data: res,
          error: res.error || null,
          loading: false,
          refreshing: false
        });
      })
      .catch(error => {
        this.setState({ error, loading: false });
      });
  };

  handleRefresh = () => {
    this.setState(
      {
        refreshing: true
      },
      () => {
        this.makeRemoteRequest();
      }
    );
  };

  handleLoadMore = () => {
    this.setState(
      {},
      () => {
        this.makeRemoteRequest();
      }
    );
  };

  renderSeparator = () => {
    return (
      <View
        style={{
          height: 1,
          width: "86%",
          backgroundColor: "#CED0CE",
          marginLeft: "14%"
        }}
      />
    );
  };

  renderHeader = () => {
    return (
      <SearchBar
        placeholder="  Recherche.."
        onChangeText={text => this.searchItems(text)}
        value={this.state.value}
      />
    )
  };

  renderFooter = () => {
    if (!this.state.loading) return null;

    return (
      <View
        style={{
          paddingVertical: 20,
          borderTopWidth: 1,
          borderColor: "#CED0CE"
        }}
      >
        <ActivityIndicator animating size="large" />
      </View>
    );
  };

  searchItems = text => {
    let newData = this.state.data.filter(item => {
      const itemData = `${item.name.toUpperCase()}`;
      const textData = text.toUpperCase();
    if(text.length >0 ){
      return itemData.indexOf(textData) > -1;
    }
    });
    this.setState({
      data: newData,
      value: text,
    });
  };

  render() {
    return (
      <View>
        <Header style={{backgroundColor:'#483a9c'}}>
          <View style={{alignContent:'center',alignItems:'center',flex:1,flexDirection:'row'}}>
          <Icon name='menu' onPress={() => this.props.navigation.openDrawer()} style={{color: '#fff'}}/>
          </View>
          <Left>
          <Image style={{width:40,height:35}} source={require('../src/img/icon.png')}/>
          </Left>
        </Header>
        <FlatList
          data={this.state.data}
          renderItem={({ item }) => (
            <ListItem
              roundAvatar
              title={`${item.name}`}
              subtitle={item.id}
              containerStyle={{ borderBottomWidth: 0 }}
            />
          )}
          keyExtractor={item => item.name}
          ItemSeparatorComponent={this.renderSeparator}
          ListHeaderComponent={this.renderHeader}
          ListFooterComponent={this.renderFooter}
          onRefresh={this.handleRefresh}
          refreshing={this.state.refreshing}
          onEndReached={this.handleLoadMore}
          onEndReachedThreshold={50}
        />
        </View>
    );
  }
}