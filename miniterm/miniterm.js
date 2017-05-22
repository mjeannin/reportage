class File {
  constructor(name) {
    this.name = name;
    this.comment = '';
  }
}

class Folder {
  constructor(name) {
    this.name = name;
    this.childs = {}
  }
}

class FileSystem {
  constructor() {
    this.root = new Folder('~');
  }
  find_parent (pwd) {
    var folder = this.root;
    var previous_folder = folder;
    pwd.slice(1).forEach(function(fname){
      previous_folder = folder;
      folder = folder.childs[fname];
    });
    return folder;
  }
}
var filetree = new FileSystem();

class Shell {
  constructor () {
    this.pwd = ['~'];
    this.current_folder = filetree.root;
    this.prev = this.current_folder;
  }
  get_pwd () {
    return this.pwd;
  }
  create_dir (dirname) {
    if (this.current_folder.childs[dirname] != undefined){
      return false;
    } else {
      this.current_folder.childs[dirname] = new Folder(dirname);
      return true;
    }
  }
}
var shell = new Shell();

var commands = {};

commands.help = function(){
  return 'test';
}

var mans = {
  'ls': 'ls lists the files and directories in your directory',
  'mkdir' : 'Creates new directory'
  // to finish
}

commands.man = function(args){
  return mans[args[1]] ? mans[args[1]] : 'No man for command ' + args[1];
}

commands.mkdir = function(args){
  if (args.length < 2){
    return 'You need to specify a name for your directory';
  }
  if (shell.create_dir(args[1])){
    return '';
  }
  else {
    return 'Could not create directory "' + args[1] + '": a directory with this name already exists.';
  }
}

commands.ls = function(args){
  var names = [];

  if (args.length > 2){
    return 'Erreur';
  } else if (args.length == 2) {
    var nodes = shell.current_folder.childs[args[1]].childs;
    return names.join('<br>');
  } else {
    var nodes = shell.current_folder.childs;
  }
    for(var index in nodes) {
       if (nodes.hasOwnProperty(index)) {
           names.push(index);
       }
    }
    return names.join('<br>');
}

commands.cd = function(args){
  if (args.length != 2){
    return 'Erreur';
  } else{
    if (args[1] == '..'){
      shell.current_folder = filetree.find_parent(shell.pwd);
      shell.pwd = shell.pwd.slice(0, shell.pwd.length - 1);
      return '';
    } else if (shell.current_folder.childs[args[1]] != undefined){
      shell.prev = shell.current_folder;
      shell.current_folder = shell.current_folder.childs[args[1]];
      shell.pwd.push(args[1]);
      return '';
    } else {
      return 'No such directory';
    }
  }
}

commands.echo = function(args){
  var str = args.slice(1).join(' ');
  return str;
}

commands.pwd = function(){
  return shell.get_pwd().join('/') + '/';
}

var terminal = document.getElementById('miniterm');
if (terminal.ready) {terminal.commands = commands;}
else {
  terminal.onload = function(){
    this.commands = commands;
  }
}
